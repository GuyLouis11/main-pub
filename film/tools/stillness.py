"""Find perceptually static stretches in a rendered MP4: blurred 320x180 frames, mean abs change per frame
(grain removed by the blur). Reports windows longer than --max seconds below --thr."""
import subprocess, sys, numpy as np
def run(path, thr=0.35, mx=1.5, offset=0.0, label=''):
    w, h = 320, 180
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', path, '-vf', f'fps=10,scale={w}:{h},gblur=sigma=3', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2))
    still = d < thr
    out, i = [], 0
    while i < len(still):
        if still[i]:
            j = i
            while j < len(still) and still[j]: j += 1
            if (j - i) / 10 > mx: out.append(((i + 1) / 10 + offset, (j + 1) / 10 + offset, (j - i) / 10))
            i = j
        else: i += 1
    for a, b, L in out: print(f"{label} static {a:7.1f}s – {b:7.1f}s  ({L:.1f}s)")
    return d, out
if __name__ == '__main__':
    args = sys.argv[1:]
    thr = float(args[args.index('--thr') + 1]) if '--thr' in args else 0.35
    mx = float(args[args.index('--max') + 1]) if '--max' in args else 1.5
    for p in [a for a in args if a.endswith('.mp4')]:
        d, out = run(p, thr, mx, label=p.split('/')[-1])
        print(p.split('/')[-1], 'median change', round(float(np.median(d)), 3), 'windows', len(out))
