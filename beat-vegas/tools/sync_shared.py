"""Copy shared/ into every chN/shared, and the Flow clips each chapter references into chN/assets/flow
(HyperFrames serves only the project dir)."""
import os, re, shutil
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
for d in sorted(os.listdir(ROOT)):
    if not re.fullmatch(r"ch\d", d):
        continue
    dst = os.path.join(ROOT, d, "shared")
    shutil.rmtree(dst, ignore_errors=True)
    shutil.copytree(os.path.join(ROOT, "shared"), dst)
    html = open(os.path.join(ROOT, d, "index.html"), encoding="utf-8").read()
    used = sorted(set(re.findall(r'src="assets/flow/([^"]+)"', html)))
    fd = os.path.join(ROOT, d, "assets", "flow")
    os.makedirs(fd, exist_ok=True)
    for f in os.listdir(fd):
        if f not in used:
            os.remove(os.path.join(fd, f))
    for f in used:
        shutil.copy2(os.path.join(ROOT, "assets", "flow", f), os.path.join(fd, f))
    print(f"synced {d}: shared + {len(used)} clips")
