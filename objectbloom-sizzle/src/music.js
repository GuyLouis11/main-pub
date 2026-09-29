// Procedural soundtrack + sound design, rendered offline with WebAudio.
// 128 BPM, D minor, 33 bars. Everything is scheduled on the same bar/beat grid
// the visuals use (timeline.js), so picture and sound can never drift.
//
// renderSoundtrack() returns an AudioBuffer. The player plays that buffer and
// derives visual time from the audio clock; the exporter writes it to WAV.

import { BAR, BEAT, DURATION, at, bar, hash } from './timeline.js';

const TAIL = 2.5; // reverb ring-out after the last bar

const NOTE = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
// i – VI – III – VII in D minor: Dm, Bb, F, C
const PROG = [
  { root: 38, chord: [62, 65, 69, 74] },   // D2  | D F A D
  { root: 34, chord: [58, 62, 65, 70] },   // Bb1 | Bb D F Bb
  { root: 41, chord: [60, 65, 69, 72] },   // F2  | C F A C
  { root: 36, chord: [60, 64, 67, 72] },   // C2  | C E G C
];
const chordAt = (b) => PROG[((b % 4) + 4) % 4];

export async function renderSoundtrack(sampleRate = 48000, onProgress) {
  const length = Math.ceil((DURATION + TAIL) * sampleRate);
  const ctx = new OfflineAudioContext(2, length, sampleRate);
  const S = buildStudio(ctx);
  compose(S);
  if (onProgress && ctx.suspend) {
    // progress callbacks every ~4 seconds of rendered audio
    for (let s = 4; s < DURATION + TAIL; s += 4) {
      ctx.suspend(s).then(() => { onProgress(s / (DURATION + TAIL)); ctx.resume(); });
    }
  }
  const buffer = await ctx.startRendering();
  onProgress?.(1);
  return buffer;
}

// ============================================================ studio / buses
function buildStudio(ctx) {
  const master = ctx.createGain();
  master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14; comp.knee.value = 6; comp.ratio.value = 5;
  comp.attack.value = 0.004; comp.release.value = 0.18;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -2; limiter.knee.value = 0; limiter.ratio.value = 20;
  limiter.attack.value = 0.001; limiter.release.value = 0.05;
  master.connect(comp).connect(limiter).connect(ctx.destination);

  // shared white noise
  const noise = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
  let seed = 1;
  for (let c = 0; c < 2; c++) {
    const d = noise.getChannelData(c);
    for (let i = 0; i < d.length; i++) { seed = (seed * 16807) % 2147483647; d[i] = (seed / 2147483647) * 2 - 1; }
  }

  // reverb
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 3.2, 2.6);
  const reverbOut = ctx.createGain(); reverbOut.gain.value = 0.55;
  reverb.connect(reverbOut).connect(master);

  // tempo delay (dotted 8th) -> reverb + master
  const delay = ctx.createDelay(2); delay.delayTime.value = BEAT * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.38;
  const delayTone = ctx.createBiquadFilter(); delayTone.type = 'lowpass'; delayTone.frequency.value = 3500;
  delay.connect(delayTone).connect(fb).connect(delay);
  const delayOut = ctx.createGain(); delayOut.gain.value = 0.5;
  delayTone.connect(delayOut); delayOut.connect(master); delayOut.connect(reverb);

  // music bus with a master filter (the "x-ray underwater" sweep) and sidechain
  const musicFilter = ctx.createBiquadFilter();
  musicFilter.type = 'lowpass'; musicFilter.frequency.value = 20000; musicFilter.Q.value = 0.9;
  const music = ctx.createGain(); music.gain.value = 1;
  music.connect(musicFilter).connect(master);

  const duck = ctx.createGain(); duck.gain.value = 1; // sidechained bus (bass, pads, arps)
  duck.connect(music);

  const drums = ctx.createGain(); drums.gain.value = 1; drums.connect(musicFilter);
  const sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(master);

  const shaper = (amount) => {
    const ws = ctx.createWaveShaper();
    const n = 2048, curve = new Float32Array(n);
    for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.tanh(x * amount) / Math.tanh(amount); }
    ws.curve = curve; ws.oversample = '2x';
    return ws;
  };

  return { ctx, master, noise, reverb, delay, music, musicFilter, duck, drums, sfx, shaper };
}

function impulse(ctx, seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  let seed = 7;
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      seed = (seed * 48271) % 2147483647;
      const r = (seed / 2147483647) * 2 - 1;
      d[i] = r * Math.pow(1 - i / len, decay) * (i < 200 ? i / 200 : 1);
    }
  }
  return buf;
}

// ============================================================ helpers
function env(g, t, peak, attack, decay, sustainLevel = 0.0001) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.0001), t + attack + decay);
}

function noiseSrc(S, t, dur) {
  const src = S.ctx.createBufferSource();
  src.buffer = S.noise; src.loop = true;
  src.start(Math.max(0, t), hash(t * 13.7) * 1.5);
  src.stop(t + dur + 0.05);
  return src;
}

function send(S, node, dest, amount) {
  const g = S.ctx.createGain(); g.gain.value = amount;
  node.connect(g).connect(dest);
}

function pan(S, node, value) {
  const p = S.ctx.createStereoPanner(); p.pan.value = value;
  node.connect(p);
  return p;
}

// ============================================================ instruments
function kick(S, t, vel = 1, hard = false) {
  const { ctx } = S;
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(hard ? 190 : 150, t);
  o.frequency.exponentialRampToValueAtTime(hard ? 48 : 44, t + 0.09);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.4);
  const g = ctx.createGain(); env(g, t, 1.0 * vel, 0.002, hard ? 0.5 : 0.42);
  let out = o.connect(g);
  if (hard) { const ws = S.shaper(2.2); out = out.connect(ws); }
  const post = ctx.createGain(); post.gain.value = hard ? 0.85 : 0.9;
  out.connect(post).connect(S.drums);
  o.start(t); o.stop(t + 0.6);
  // click
  const n = noiseSrc(S, t, 0.02);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
  const ng = ctx.createGain(); env(ng, t, 0.25 * vel, 0.001, 0.015);
  n.connect(hp).connect(ng).connect(S.drums);
  // sidechain duck
  const d = S.duck.gain;
  d.setValueAtTime(1, t);
  d.setTargetAtTime(0.18, t, 0.004);
  d.setTargetAtTime(1, t + 0.03, 0.09);
}

function clap(S, t, vel = 1) {
  const { ctx } = S;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = 0.9;
  const g = ctx.createGain(); g.gain.value = 0;
  for (let i = 0; i < 3; i++) {
    g.gain.setValueAtTime(0.9 * vel, t + i * 0.011);
    g.gain.exponentialRampToValueAtTime(0.05, t + i * 0.011 + 0.009);
  }
  g.gain.setValueAtTime(0.8 * vel, t + 0.033);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  const n = noiseSrc(S, t, 0.3);
  n.connect(bp).connect(g);
  g.connect(S.drums); send(S, g, S.reverb, 0.35);
  // body
  const o = ctx.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.08);
  const og = ctx.createGain(); env(og, t, 0.35 * vel, 0.001, 0.1);
  o.connect(og).connect(S.drums); o.start(t); o.stop(t + 0.2);
}

function snare(S, t, vel = 1, pitch = 1) {
  const { ctx } = S;
  const n = noiseSrc(S, t, 0.2);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200 * pitch; bp.Q.value = 0.7;
  const g = ctx.createGain(); env(g, t, 0.6 * vel, 0.001, 0.13);
  n.connect(bp).connect(g).connect(S.drums);
  send(S, g, S.reverb, 0.2);
  const o = ctx.createOscillator(); o.type = 'triangle';
  o.frequency.setValueAtTime(260 * pitch, t); o.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.06);
  const og = ctx.createGain(); env(og, t, 0.3 * vel, 0.001, 0.08);
  o.connect(og).connect(S.drums); o.start(t); o.stop(t + 0.15);
}

function hat(S, t, vel = 0.3, open = false, panV = 0) {
  const { ctx } = S;
  const n = noiseSrc(S, t, open ? 0.35 : 0.06);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = open ? 7000 : 8500;
  const g = ctx.createGain(); env(g, t, vel, 0.001, open ? 0.28 : 0.035);
  pan(S, n.connect(hp).connect(g), panV).connect(S.drums);
}

function bass(S, t, dur, midi, vel = 1, reese = false) {
  const { ctx } = S;
  const f = NOTE(midi);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = reese ? 6 : 4;
  const top = reese ? 1400 : 900;
  lp.frequency.setValueAtTime(top, t);
  lp.frequency.exponentialRampToValueAtTime(reese ? 220 : 160, t + dur * 0.9);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.42 * vel, t + 0.008);
  g.gain.setValueAtTime(0.42 * vel, t + dur * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const detunes = reese ? [-14, 14, 0] : [-6, 6];
  for (const d of detunes) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d;
    o.connect(lp); o.start(t); o.stop(t + dur + 0.02);
  }
  const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.value = f / (reese ? 2 : 1);
  const sg = ctx.createGain(); sg.gain.value = 0.7; sub.connect(sg).connect(g);
  sub.start(t); sub.stop(t + dur + 0.02);
  let out = lp.connect(g);
  if (reese) out = out.connect(S.shaper(1.8));
  out.connect(S.duck);
}

function pluck(S, t, midi, vel = 0.2, panV = 0, bright = 3200) {
  const { ctx } = S;
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(midi);
  const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = NOTE(midi) * 1.002;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5;
  lp.frequency.setValueAtTime(bright, t); lp.frequency.exponentialRampToValueAtTime(350, t + 0.18);
  const g = ctx.createGain(); env(g, t, vel, 0.003, 0.26);
  o.connect(lp); o2.connect(lp);
  const p = pan(S, lp.connect(g), panV);
  p.connect(S.duck); send(S, p, S.delay, 0.45); send(S, p, S.reverb, 0.18);
  o.start(t); o.stop(t + 0.35); o2.start(t); o2.stop(t + 0.35);
}

function pad(S, t, dur, notes, vel = 0.08, cutoff = 1400) {
  const { ctx } = S;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff; lp.Q.value = 0.6;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vel, t + Math.min(0.6, dur * 0.4));
  g.gain.setValueAtTime(vel, t + dur * 0.8);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.4);
  for (const m of notes) {
    for (const d of [-9, 9]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(m); o.detune.value = d;
      o.connect(lp); o.start(t); o.stop(t + dur + 0.5);
    }
  }
  lp.connect(g); g.connect(S.duck); send(S, g, S.reverb, 0.5);
}

function stab(S, t, notes, vel = 0.12) {
  const { ctx } = S;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
  lp.frequency.setValueAtTime(6000, t); lp.frequency.exponentialRampToValueAtTime(800, t + 0.22);
  const g = ctx.createGain(); env(g, t, vel, 0.002, 0.3);
  for (const m of notes) {
    for (const d of [-18, 0, 18]) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(m); o.detune.value = d;
      o.connect(lp); o.start(t); o.stop(t + 0.4);
    }
  }
  lp.connect(g).connect(S.duck); send(S, g, S.reverb, 0.3); send(S, g, S.delay, 0.25);
}

// ---------------------------------------------------------------- sound FX
function impact(S, t, size = 1) {
  const { ctx } = S;
  // sub drop
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(26, t + 1.6);
  const og = ctx.createGain(); env(og, t, 1.1 * size, 0.003, 1.9);
  o.connect(og).connect(S.shaper(1.5)).connect(S.sfx); o.start(t); o.stop(t + 2.1);
  // crack + body
  const n = noiseSrc(S, t, 2.5);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(9000, t); lp.frequency.exponentialRampToValueAtTime(180, t + 1.2);
  const ng = ctx.createGain(); env(ng, t, 0.9 * size, 0.001, 1.6);
  n.connect(lp).connect(ng).connect(S.sfx);
  send(S, ng, S.reverb, 0.9);
}

function whoosh(S, t, dur = 0.6, dir = 1, vel = 0.5) {
  const { ctx } = S;
  const n = noiseSrc(S, t - dur, dur + 0.4);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.6;
  bp.frequency.setValueAtTime(300, t - dur);
  bp.frequency.exponentialRampToValueAtTime(4200, t);
  bp.frequency.exponentialRampToValueAtTime(700, t + 0.35);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t - dur);
  g.gain.exponentialRampToValueAtTime(vel, t - 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  const p = ctx.createStereoPanner();
  p.pan.setValueAtTime(-0.9 * dir, t - dur); p.pan.linearRampToValueAtTime(0.9 * dir, t + 0.3);
  n.connect(bp).connect(g).connect(p).connect(S.sfx);
  send(S, p, S.reverb, 0.25);
}

function riser(S, t0, t1, vel = 0.35) {
  const { ctx } = S;
  const n = noiseSrc(S, t0, t1 - t0 + 0.1);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.5;
  bp.frequency.setValueAtTime(250, t0); bp.frequency.exponentialRampToValueAtTime(9000, t1);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vel, t1); g.gain.linearRampToValueAtTime(0.0001, t1 + 0.04);
  n.connect(bp).connect(g).connect(S.sfx); send(S, g, S.reverb, 0.4);
  // pitch riser
  for (const d of [-20, 20]) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = d;
    o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(1760, t1);
    const og = ctx.createGain(); og.gain.setValueAtTime(0.0001, t0);
    og.gain.exponentialRampToValueAtTime(vel * 0.18, t1); og.gain.linearRampToValueAtTime(0.0001, t1 + 0.03);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000;
    o.connect(lp).connect(og).connect(S.sfx); o.start(t0); o.stop(t1 + 0.05);
  }
}

function snareRoll(S, t0, t1) {
  let t = t0;
  while (t < t1 - 0.01) {
    const k = (t - t0) / (t1 - t0);
    const step = k < 0.35 ? BEAT / 2 : k < 0.65 ? BEAT / 4 : k < 0.88 ? BEAT / 8 : BEAT / 16;
    snare(S, t, 0.25 + k * 0.75, 0.85 + k * 0.6);
    t += step;
  }
}

function reverseCymbal(S, t, dur = 1.6) {
  const { ctx } = S;
  const n = noiseSrc(S, t - dur, dur + 0.1);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4500;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t - dur);
  g.gain.exponentialRampToValueAtTime(0.45, t - 0.01); g.gain.linearRampToValueAtTime(0.0001, t);
  n.connect(hp).connect(g).connect(S.sfx); send(S, g, S.reverb, 0.3);
}

function clank(S, t, vel = 0.4, tone = 1) {
  const { ctx } = S;
  const partials = [1, 2.76, 5.4, 8.93, 13.34];
  const base = 420 * tone * (0.9 + hash(t * 3.1) * 0.25);
  const out = ctx.createGain(); out.gain.value = vel;
  partials.forEach((p, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = base * p;
    const g = ctx.createGain(); env(g, t, 0.5 / (i + 1), 0.001, 0.5 / (1 + i * 0.6));
    o.connect(g).connect(out); o.start(t); o.stop(t + 0.7);
  });
  const n = noiseSrc(S, t, 0.05);
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
  const ng = ctx.createGain(); env(ng, t, 0.6, 0.0005, 0.03);
  n.connect(hp).connect(ng).connect(out);
  const p = pan(S, out, (hash(t) - 0.5) * 1.4);
  p.connect(S.sfx); send(S, p, S.reverb, 0.35);
  // low thud for weight
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.15);
  const og = ctx.createGain(); env(og, t, vel * 0.9, 0.001, 0.2);
  o.connect(og).connect(S.sfx); o.start(t); o.stop(t + 0.3);
}

function bleep(S, t, freq = 1760, vel = 0.12, dur = 0.07) {
  const { ctx } = S;
  const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
  const g = ctx.createGain(); env(g, t, vel, 0.002, dur);
  const p = pan(S, o.connect(g), (hash(t * 7) - 0.5) * 1.2);
  p.connect(S.sfx); send(S, p, S.delay, 0.5);
  o.start(t); o.stop(t + dur + 0.05);
}

function scanSweep(S, t0, dur) {
  const { ctx } = S;
  const o = ctx.createOscillator(); o.type = 'sawtooth';
  o.frequency.setValueAtTime(90, t0); o.frequency.exponentialRampToValueAtTime(360, t0 + dur);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 8;
  bp.frequency.setValueAtTime(400, t0); bp.frequency.exponentialRampToValueAtTime(5000, t0 + dur);
  const trem = ctx.createGain(); trem.gain.value = 0.5;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 32; const lg = ctx.createGain(); lg.gain.value = 0.5;
  lfo.connect(lg).connect(trem.gain);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(0.22, t0 + 0.1); g.gain.setValueAtTime(0.22, t0 + dur - 0.1);
  g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  const p = ctx.createStereoPanner();
  p.pan.setValueAtTime(0.8, t0); p.pan.linearRampToValueAtTime(-0.8, t0 + dur);
  o.connect(bp).connect(trem).connect(g).connect(p).connect(S.sfx);
  send(S, p, S.reverb, 0.3);
  o.start(t0); o.stop(t0 + dur + 0.05); lfo.start(t0); lfo.stop(t0 + dur + 0.05);
}

function glitch(S, t, dur = 0.25) {
  const { ctx } = S;
  const n = Math.floor(dur / 0.022);
  for (let i = 0; i < n; i++) {
    const tt = t + i * 0.022;
    const o = ctx.createOscillator(); o.type = hash(tt) > 0.5 ? 'square' : 'sawtooth';
    o.frequency.value = 80 + hash(tt * 9.1) * 2400;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.09, tt); g.gain.setValueAtTime(0.0001, tt + 0.018);
    pan(S, o.connect(g), hash(tt * 3) * 2 - 1).connect(S.sfx);
    o.start(tt); o.stop(tt + 0.02);
  }
}

// V12 rev: firing frequency sweep through distortion, with gear-shift dips.
function engineRev(S, t0, dur, peak = 1, shifts = []) {
  const { ctx } = S;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.linearRampToValueAtTime(0.32 * peak, t0 + 0.12);
  out.gain.setValueAtTime(0.32 * peak, t0 + dur - 0.35);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const freqPath = (param, mul) => {
    param.setValueAtTime(55 * mul, t0);
    for (const s of shifts) {
      param.exponentialRampToValueAtTime(330 * mul, s - 0.02);
      param.exponentialRampToValueAtTime(210 * mul, s + 0.08);
    }
    param.exponentialRampToValueAtTime(360 * mul, t0 + dur - 0.3);
    param.exponentialRampToValueAtTime(80 * mul, t0 + dur);
  };
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
  lp.frequency.setValueAtTime(500, t0); lp.frequency.linearRampToValueAtTime(3800, t0 + dur - 0.3);
  lp.frequency.exponentialRampToValueAtTime(400, t0 + dur);
  for (const [mul, type, lvl] of [[1, 'sawtooth', 0.6], [1.5, 'square', 0.25], [0.5, 'sawtooth', 0.5], [2.01, 'sawtooth', 0.15]]) {
    const o = ctx.createOscillator(); o.type = type; freqPath(o.frequency, mul);
    const g = ctx.createGain(); g.gain.value = lvl;
    o.connect(g).connect(lp); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  // combustion roughness
  const am = ctx.createGain(); am.gain.value = 0.7;
  const lfo = ctx.createOscillator(); lfo.type = 'square'; freqPath(lfo.frequency, 0.25);
  const lg = ctx.createGain(); lg.gain.value = 0.3; lfo.connect(lg).connect(am.gain);
  lfo.start(t0); lfo.stop(t0 + dur + 0.05);
  lp.connect(am).connect(S.shaper(3)).connect(out);
  const p = ctx.createStereoPanner(); p.pan.setValueAtTime(-0.5, t0); p.pan.linearRampToValueAtTime(0.5, t0 + dur);
  out.connect(p).connect(S.sfx); send(S, p, S.reverb, 0.2);
  // exhaust pops on lift-off
  for (let i = 0; i < 6; i++) {
    const tt = t0 + dur - 0.25 + i * 0.07 + hash(i + t0) * 0.03;
    const n = noiseSrc(S, tt, 0.06);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600 + hash(i * 3 + t0) * 900;
    const g = ctx.createGain(); env(g, tt, 0.5 * peak, 0.001, 0.05);
    n.connect(bp).connect(g).connect(S.sfx); send(S, g, S.reverb, 0.4);
  }
}

// ============================================================ arrangement
function compose(S) {
  const { musicFilter } = S;
  const mf = musicFilter.frequency;

  // --------------------------------------------------- 0-4 IGNITION
  pad(S, 0, bar(4), [38, 45, 50], 0.06, 500);                 // low drone D-A-D
  for (let b = 0; b < 4; b++) {
    // heartbeat
    kick(S, at(b, 0), 0.8); kick(S, at(b, 0.5), 0.45);
    for (let i = 0; i < 8; i++) hat(S, at(b, i / 2), 0.07 + (i % 2) * 0.05, false, (i % 2 ? 0.4 : -0.4));
    if (b > 0) whoosh(S, bar(b) + 0.001, 0.45, b % 2 ? 1 : -1, 0.35);
  }
  for (let i = 0; i < 5; i++) glitch(S, at(0, 1 + i * 0.5), 0.07);  // word flashes
  engineRev(S, bar(1.5), bar(2.5) - 0.1, 0.9, [bar(2.5), bar(3.25)]);
  glitch(S, at(3, 2), 0.3);
  reverseCymbal(S, bar(4), 1.8);
  riser(S, bar(3), bar(4) - 0.02, 0.3);

  // --------------------------------------------------- 4-8 REVEAL
  impact(S, bar(4), 1);
  for (let b = 4; b < 8; b++) {
    const c = chordAt(b);
    for (let i = 0; i < 4; i++) kick(S, at(b, i));
    for (let i = 0; i < 4; i++) bass(S, at(b, i + 0.5), BEAT * 0.45, c.root + 12 * (i === 3 ? 1 : 0), 0.9);
    for (let i = 0; i < 16; i++) {
      const n = c.chord[[0, 2, 1, 3, 2, 0, 3, 1][i % 8]] + (i >= 8 ? 12 : 0);
      pluck(S, at(b, i / 4), n, 0.1 + (b - 4) * 0.025, i % 2 ? 0.5 : -0.5, 1800 + (b - 4) * 700);
    }
    for (let i = 0; i < 4; i++) hat(S, at(b, i + 0.5), 0.16, true);
    if (b >= 6) { clap(S, at(b, 1)); clap(S, at(b, 3)); }
    if (b > 4) whoosh(S, bar(b), 0.5, b % 2 ? 1 : -1, 0.4);
    pad(S, bar(b), BAR, c.chord.map((m) => m - 12), 0.04, 1200);
  }
  snareRoll(S, at(7, 2), bar(8));
  riser(S, at(7, 0), bar(8), 0.3);

  // --------------------------------------------------- 8-12 X-RAY (filtered)
  impact(S, bar(8), 0.8);
  mf.setValueAtTime(20000, bar(8) - 0.01);
  mf.exponentialRampToValueAtTime(700, bar(8) + 0.25);
  mf.setValueAtTime(700, bar(10));
  mf.exponentialRampToValueAtTime(2600, bar(12) - 0.05);
  mf.setValueAtTime(20000, bar(12));
  scanSweep(S, bar(8), bar(1));
  scanSweep(S, bar(10), bar(1));
  for (let b = 8; b < 12; b++) {
    const c = chordAt(b);
    for (let i = 0; i < 4; i++) kick(S, at(b, i), 0.9);
    for (let i = 0; i < 8; i++) bass(S, at(b, i / 2 + 0.25), BEAT * 0.22, c.root, 0.8);
    for (let i = 0; i < 16; i++) hat(S, at(b, i / 4), i % 4 === 2 ? 0.18 : 0.08, false, Math.sin(i) * 0.6);
    clap(S, at(b, 1), 0.8); clap(S, at(b, 3), 0.8);
    pad(S, bar(b), BAR, c.chord, 0.05, 900);
    // HUD callout bleeps (clean, bypass the filter via sfx bus)
    if (b >= 9) for (const k of [0, 1.5, 2.5]) bleep(S, at(b, k), [1760, 2217, 2637][(b + k * 2) % 3 | 0], 0.1);
  }
  whoosh(S, bar(10), 0.5, -1, 0.35);
  scanSweep(S, at(11, 2), BAR / 2);

  // --------------------------------------------------- 12-16 DECONSTRUCT
  impact(S, bar(12), 1);
  for (let b = 12; b < 16; b++) {
    const c = chordAt(b);
    for (let i = 0; i < 4; i++) {
      if (!(b === 15 && i === 3)) kick(S, at(b, i));
    }
    if (b < 15) {
      for (let i = 0; i < 4; i++) bass(S, at(b, i + 0.5), BEAT * 0.45, c.root, 1);
      for (let i = 0; i < 4; i++) hat(S, at(b, i + 0.5), 0.18, true);
      clap(S, at(b, 1)); clap(S, at(b, 3));
    }
    for (let i = 0; i < 8; i++) pluck(S, at(b, i / 2), c.chord[i % 4] + 12, 0.08, i % 2 ? 0.6 : -0.6, 2600);
  }
  // one detach per beat for bars 12-13: clank + whoosh
  for (let k = 0; k < 8; k++) { clank(S, at(12, k), 0.5, 0.8 + (k % 4) * 0.15); whoosh(S, at(12, k) + 0.02, 0.2, k % 2 ? 1 : -1, 0.22); }
  riser(S, bar(14), at(15, 3), 0.45);
  snareRoll(S, bar(14), at(15, 3));
  mf.setValueAtTime(20000, bar(14));
  mf.exponentialRampToValueAtTime(1200, at(15, 2.5));
  mf.setValueAtTime(20000, at(15, 3));
  reverseCymbal(S, bar(16), BEAT);                             // air before the drop
  bleep(S, at(15, 3), 3520, 0.12, 0.3);

  // --------------------------------------------------- 16-24 DROP
  for (let b = 16; b < 24; b++) {
    const c = chordAt(b);
    const fill = b === 19 || b === 23;
    for (let i = 0; i < 4; i++) if (!(fill && i === 3)) kick(S, at(b, i), 1, true);
    // reese bass rhythm: 1 . 1 1 . 1 . 1 (16ths)
    const pattern = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0];
    for (let i = 0; i < 16; i++) {
      if (!pattern[i] || (fill && i >= 12)) continue;
      const oct = i === 7 || i === 13 ? 12 : 0;
      bass(S, at(b, i / 4 + 0.02), BEAT / 4 * 0.9, c.root + oct, 1, true);
    }
    clap(S, at(b, 1), 1); clap(S, at(b, 3), 1);
    for (let i = 0; i < 16; i++) hat(S, at(b, i / 4), i % 2 ? 0.1 : 0.2, i % 4 === 2, (i % 2 ? 0.35 : -0.35));
    // offbeat supersaw stabs
    for (const k of [0.5, 1.75, 2.5, 3.25]) if (!(fill && k > 3)) stab(S, at(b, k), c.chord, 0.07);
    // lead arp an octave up, delayed
    for (let i = 0; i < 8; i++) pluck(S, at(b, i / 2 + 0.25), c.chord[(i * 3) % 4] + 24, 0.05, Math.sin(i * 1.7) * 0.8, 5000);
    pad(S, bar(b), BAR, c.chord.map((m) => m - 12), 0.035, 2400);
    whoosh(S, bar(b) + 0.001, 0.35, b % 2 ? 1 : -1, 0.45);
    whoosh(S, at(b, 2) + 0.001, 0.3, b % 2 ? -1 : 1, 0.3);
    if (fill) { glitch(S, at(b, 3), BEAT); snare(S, at(b, 3.5), 0.8, 1.3); snare(S, at(b, 3.75), 1, 1.5); }
  }
  for (const b of [16, 18, 20, 22]) impact(S, bar(b), b === 16 ? 1.3 : 0.9);
  for (let k = 0; k < 8; k++) clank(S, at(20, k * 0.5 + 0.25), 0.2, 1.6);  // x-ray strobe ticks

  // --------------------------------------------------- 24-28 BLUEPRINT (half-time)
  impact(S, bar(24), 0.9);
  mf.setValueAtTime(20000, bar(24) - 0.01);
  mf.exponentialRampToValueAtTime(1800, bar(24) + 0.4);
  mf.setValueAtTime(1800, bar(26));
  mf.exponentialRampToValueAtTime(9000, bar(28) - 0.05);
  for (let b = 24; b < 28; b++) {
    const c = chordAt(b);
    kick(S, at(b, 0), 0.9); kick(S, at(b, 2.5), 0.7);
    snare(S, at(b, 2), 0.7);
    pad(S, bar(b), BAR, c.chord, 0.07, 1800);
    bass(S, at(b, 0), BAR * 0.95, c.root, 0.5);
    for (let i = 0; i < 16; i++) pluck(S, at(b, i / 4), c.chord[[0, 1, 2, 3, 2, 1][i % 6]] + 12, 0.07, Math.sin(i) * 0.9, 1400 + i * 120);
    for (let i = 0; i < 8; i++) hat(S, at(b, i / 2 + 0.25), 0.07, false, 0.5);
    bleep(S, at(b, 1), 2637, 0.07); bleep(S, at(b, 3.5), 1760, 0.06);
  }
  scanSweep(S, bar(25), bar(1));
  scanSweep(S, bar(27), bar(1));

  // --------------------------------------------------- 28-30 REBUILD
  for (let b = 28; b < 30; b++) {
    const c = chordAt(b);
    for (let i = 0; i < 4; i++) kick(S, at(b, i), 1);
    for (let i = 0; i < 8; i++) bass(S, at(b, i / 2 + 0.25), BEAT * 0.22, c.root, 0.9);
    for (let i = 0; i < 16; i++) hat(S, at(b, i / 4), 0.12, false, Math.sin(i) * 0.5);
    for (let i = 0; i < 8; i++) pluck(S, at(b, i / 2), c.chord[i % 4] + 12, 0.1, i % 2 ? 0.5 : -0.5, 4000);
  }
  for (let k = 0; k < 8; k++) { clank(S, at(28, k), 0.7, 1.0 + k * 0.06); whoosh(S, at(28, k), 0.3, k % 2 ? 1 : -1, 0.3); }
  riser(S, bar(28), bar(30), 0.4);
  snareRoll(S, bar(29), bar(30));

  // --------------------------------------------------- 30-33 OUTRO
  impact(S, bar(30), 1.4);
  kick(S, bar(30), 1, true);
  engineRev(S, bar(30) + 0.05, bar(1.6), 1, [at(30, 3)]);
  stab(S, bar(30), [50, 57, 62, 65, 69], 0.12);
  pad(S, bar(30), bar(2.5), [38, 50, 57, 62, 65, 69, 74], 0.08, 2600);
  for (let i = 0; i < 12; i++) pluck(S, at(30, 1 + i / 2), [74, 77, 81, 86][i % 4], 0.07 * (1 - i / 14), Math.sin(i) * 0.8, 3000);
  bleep(S, at(31, 0), 1760, 0.12, 0.2); bleep(S, at(31, 0.5), 2637, 0.1, 0.2);
  kick(S, bar(32), 0.9); impact(S, bar(32), 0.6);
  stab(S, bar(32), [38, 50, 57, 62], 0.1);
}

// ============================================================ WAV encoding
export function audioBufferToWav(buffer) {
  const ch = buffer.numberOfChannels, sr = buffer.sampleRate, len = buffer.length;
  const bytes = 44 + len * ch * 2;
  const out = new DataView(new ArrayBuffer(bytes));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); out.setUint32(4, bytes - 8, true); str(8, 'WAVE');
  str(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true);
  str(36, 'data'); out.setUint32(40, len * ch * 2, true);
  const data = []; for (let c = 0; c < ch; c++) data.push(buffer.getChannelData(c));
  let o = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, data[c][i]));
      out.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
    }
  }
  return out.buffer;
}
