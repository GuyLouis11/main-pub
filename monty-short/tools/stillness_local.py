"""Local-motion stillness audit for rendered MP4s. Unlike stillness.py (whole-frame mean change), a moment counts as
'moving' if ANY 16x16 block of a blurred 320x180 frame changed by more than --thr grey levels versus 0.4 s earlier,
so a travelling dot, a line being drawn or a small label popping in all count. Grain is removed by the blur.
  python3 tools/stillness_local.py renders/parts/*.mp4 [--thr 2.0] [--max 1.5]"""
import subprocess, sys, numpy as np
def run(path, thr=2.0, mx=1.5, fps=10, lag=4):
    w, h, b = 320, 180, 16
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vf', f'fps={fps},scale={w}:{h},gblur=sigma=2', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    D = np.abs(F[lag:] - F[:-lag])[:, :h // b * b, :w // b * b].reshape(-1, h // b, b, w // b, b).mean(axis=(2, 4)).max(axis=(1, 2))
    moving = np.concatenate([np.ones(lag, bool), D > thr])
    out, i = [], 0
    while i < len(moving):
        if not moving[i]:
            j = i
            while j < len(moving) and not moving[j]: j += 1
            if (j - i) / fps > mx: out.append((i / fps, j / fps, (j - i) / fps))
            i = j
        else: i += 1
    return out
if __name__ == '__main__':
    a = sys.argv[1:]
    thr = float(a[a.index('--thr') + 1]) if '--thr' in a else 2.0
    mx = float(a[a.index('--max') + 1]) if '--max' in a else 1.5
    for p in [x for x in a if x.endswith('.mp4')]:
        out = run(p, thr, mx)
        print(p.split('/')[-1], 'static windows >', mx, 's:', len(out))
        for s, e, L in out: print(f'   {s:7.1f}–{e:6.1f}s  ({L:.1f}s)')
