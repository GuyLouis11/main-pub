"""Create clearly labelled placeholder clips for PENDING Flow slots (A-tier) that have no real file yet.
A real clip dropped in with the same filename simply replaces the card; nothing else changes."""
import json, os, re, subprocess
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
def card(path, name, lines):
    txt = ",".join(f"drawtext=fontfile={FONT}:text='{l}':x=90:y={560 + i * 40}:fontsize=28:fontcolor=0xf3e7d0@0.9" for i, l in enumerate(lines))
    vf = (f"noise=alls=4:allf=t,vignette=PI/4,drawbox=x=50:y=50:w=1180:h=620:color=0xffcf3a@0.6:t=3,"
          f"drawtext=fontfile={FONT}:text='PENDING FLOW SHOT - PLACEHOLDER':x=90:y=90:fontsize=26:fontcolor=0xffcf3a,"
          f"drawtext=fontfile={FONT}:text='{name}':x=90:y=135:fontsize=40:fontcolor=0xf3e7d0,{txt},"
          f"drawtext=fontfile={FONT}:text='t=%{{pts\\:hms}}':x=1060:y=90:fontsize=22:fontcolor=0xf3e7d0@0.6")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i",
                    "gradients=s=1280x720:c0=0x0b1320:c1=0x1e2d40:x0=0:y0=0:x1=1280:y1=720:speed=0.004:d=8:r=24",
                    "-vf", vf, "-t", "8", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", path], check=True)
for ch in sorted(d for d in os.listdir(ROOT) if re.fullmatch(r"ch\d", d)):
    html = open(os.path.join(ROOT, ch, "index.html"), encoding="utf-8").read()
    tim = json.loads(re.search(r'<script id="timing" type="application/json">\n(.*?)\n</script>', html, re.S).group(1))
    os.makedirs(os.path.join(ROOT, ch, "assets", "flow"), exist_ok=True)
    for sc in tim["scenes"]:
        fl = sc.get("flow")
        if not fl or fl.get("tier") != "A" or f'src="assets/flow/{fl["file"]}"' not in html:
            continue
        path = os.path.join(ROOT, ch, "assets", "flow", fl["file"])
        if os.path.exists(path) and not os.path.exists(path + ".placeholder"):
            continue  # a real clip is in place
        card(path, fl["file"].replace(".mp4", ""), [f"scene {sc['id']} - usable {fl['in']}-{fl['out']} s", "see hot-water-opening/NEXT_SHOTS.md"])
        open(path + ".placeholder", "w").write("placeholder card; replace the .mp4 and delete this marker\n")
        print("placeholder", path)
