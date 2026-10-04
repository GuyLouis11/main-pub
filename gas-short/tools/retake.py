"""Auto-retake: for each flagged line (pitch > 3 st off or whispered), generate up to N takes into a staging dir and keep the
best (unflagged, closest to the reference pitch).   python3 tools/retake.py <stage_dir> [N]"""
import os, shutil, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, "..")
stage = sys.argv[1]; N = int(sys.argv[2]) if len(sys.argv) > 2 else 3

def qa(d, ids=()):
    out = subprocess.run([sys.executable, os.path.join(here, "voqa.py"), d, *ids], capture_output=True, text=True, cwd=root).stdout
    rows = {}
    for ln in out.splitlines():
        p = ln.split()
        if len(p) > 8 and p[1] == "F0":
            try: st = float(p[4])
            except ValueError: st = 99.0
            rows[p[0]] = (abs(st), float(p[9]), p[-1])
    return rows

rows = qa(stage)
bad = [k for k, v in rows.items() if v[2] != "ok"]
print("flagged:", bad)
for vid in bad:
    best = (rows[vid][2] != "ok", rows[vid][0])
    for k in range(N):
        tmp = os.path.join(root, "assets", f"vo_rt_{vid}_{k}")
        subprocess.run([sys.executable, os.path.join(here, "vo.py"), "--force", vid], cwd=root, env={**os.environ, "VO_DIR": tmp}, capture_output=True)
        r = qa(tmp, [vid]).get(vid)
        if r:
            cand = (r[2] != "ok", r[0])
            print(f"  {vid} take {k + 1}: {r[0]:.1f} st, voiced {r[1]:.2f}, {r[2]}")
            if cand < best:
                best = cand
                for ext in (".wav", ".words.json"): shutil.copy(os.path.join(tmp, vid + ext), os.path.join(stage, vid + ext))
        shutil.rmtree(tmp, ignore_errors=True)
        if not best[0]: break
    print(f"  {vid} -> {'ok' if not best[0] else 'STILL FLAGGED'} ({best[1]:.1f} st)")
