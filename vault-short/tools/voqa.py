"""Voice QA (CLAUDE.md §4/§7.6): median F0 per take vs the narrator median (~131 Hz on v4), pace in words/s.
Flags lines more than 3 semitones off.   python3 tools/voqa.py [vo_dir]"""
import glob, json, os, sys
import numpy as np, librosa
REF = 131.0
d = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "vo")
rows = []
for wav in sorted(glob.glob(os.path.join(d, "*.wav"))):
    y, sr = librosa.load(wav, sr=16000)
    f0, vflag, _ = librosa.pyin(y, fmin=65, fmax=400, sr=sr, frame_length=1024)
    f = f0[vflag & ~np.isnan(f0)]
    med = float(np.median(f)) if len(f) else float("nan")
    words = json.load(open(wav[:-4] + ".words.json"))
    st = 12 * np.log2(med / REF)
    rows.append((os.path.basename(wav)[:-4], med, st, len(words) / (len(y) / sr)))
for vid, med, st, wps in rows:
    print(f"{vid}  F0 {med:6.1f} Hz  {st:+5.1f} st  {wps:4.2f} w/s  {'FLAG' if abs(st) > 3 else 'ok'}")
meds = np.array([r[1] for r in rows])
print(f"set median {np.median(meds):.1f} Hz, flagged {sum(abs(r[2]) > 3 for r in rows)}/{len(rows)}")
