"""Voice QA (CLAUDE.md §4/§7.6): per take, median F0 vs the narrator median (~131 Hz on v4), pace in words/s, and
'voiced' = share of speech frames with a pitch. Measured on vowel-band frames: a whispered read scores low (< ~0.55); a clear read is ~0.7+.
Flags: more than 3 semitones off, or voiced below 0.55 (whisper).   python3 tools/voqa.py [vo_dir] [IDs…]"""
import glob, json, os, sys
import numpy as np, librosa
REF = float(os.environ.get("VO_REF", "131"))   # long-form: the video's own median is the target
args = sys.argv[1:]
d = args[0] if args and os.path.isdir(args[0]) else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "vo")
only = {a for a in args if not os.path.isdir(a)}
rows = []
for wav in sorted(glob.glob(os.path.join(d, "*.wav"))):
    vid = os.path.basename(wav)[:-4]
    if only and vid not in only: continue
    y, sr = librosa.load(wav, sr=16000)
    f0, vflag, _ = librosa.pyin(y, fmin=65, fmax=400, sr=sr, frame_length=1024)
    # speech frames = energy in the vowel band (80-1000 Hz); hissy consonants (s, sh, f) live above 3 kHz and would
    # otherwise count against the line as 'unvoiced' even in a normal, clear read
    S_ = np.abs(librosa.stft(y, n_fft=1024, hop_length=256)); fq = librosa.fft_frequencies(sr=sr, n_fft=1024)
    low = S_[(fq >= 80) & (fq <= 1000)].sum(0)[:len(vflag)]
    speech = low > (low.max() * 10 ** (-24 / 20))
    voiced = float((vflag[:len(speech)] & speech).sum() / max(1, speech.sum()))
    f = f0[vflag & ~np.isnan(f0)]
    med = float(np.median(f)) if len(f) else float("nan")
    st = 12 * np.log2(med / REF) if len(f) else float("nan")
    words = json.load(open(wav[:-4] + ".words.json"))
    flag = "WHISPER" if voiced < .55 else ("FLAG" if not abs(st) <= 3 else "ok")
    rows.append((vid, med, st, len(words) / (len(y) / sr), voiced, flag))
for vid, med, st, wps, vc, fl in rows:
    print(f"{vid}  F0 {med:6.1f} Hz  {st:+5.1f} st  {wps:4.2f} w/s  voiced {vc:.2f}  {fl}")
print(f"flagged {sum(r[5] != 'ok' for r in rows)}/{len(rows)}")
