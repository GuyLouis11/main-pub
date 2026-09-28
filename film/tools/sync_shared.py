"""Copy film/shared into every chN/shared (HyperFrames serves only the project dir)."""
import os, re, shutil
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
for d in sorted(os.listdir(ROOT)):
    if re.fullmatch(r"ch\d", d):
        dst = os.path.join(ROOT, d, "shared")
        shutil.rmtree(dst, ignore_errors=True)
        shutil.copytree(os.path.join(ROOT, "shared"), dst)
        print("synced", dst)
