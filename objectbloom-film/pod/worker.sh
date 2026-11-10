#!/usr/bin/env bash
# Runs on every render node (the hub included). Env: HUB, HUB_TOKEN, JOB, RES, SAMPLES, [SETUP=0 to skip installing].
# Work queue: the film is cut into chunks of 12 frames; a node claims a chunk on the hub (an atomic mkdir), renders it,
# sends the frames to the hub, and claims the next, until none are left. Any number of nodes can join or drop out.
set -u
mkdir -p /workspace && cd /workspace
log() { echo "$(date +%T) $*" >> /workspace/worker_$JOB.log; }
H=(-sS -H "X-Token: $HUB_TOKEN")
until curl "${H[@]}" -m 30 -f "$HUB/" >/dev/null 2>&1; do sleep 5; done
if [ "${SETUP:-1}" = 1 ]; then
  curl -sSfL -o b.tar.xz https://download.blender.org/release/Blender5.3/blender-5.3.0-linux-x64.tar.xz && tar xf b.tar.xz && mv blender-5.3.0-linux-x64 blender && rm b.tar.xz
  apt-get update -qq >/dev/null 2>&1; apt-get install -y -qq libxi6 libxxf86vm1 libxfixes3 libxrender1 libgl1 libxkbcommon0 libsm6 libice6 >/dev/null 2>&1
  curl "${H[@]}" -f -o proj.tgz "$HUB/f/proj.tgz" && mkdir -p p && tar xzf proj.tgz -C p && (cd p && python3 tools/link_ui.py)
fi
log "ready $(nvidia-smi --query-gpu=name --format=csv,noheader | head -1)"
CH=12
cd /workspace/p
for c in $(python3 -c "import random; l=list(range(80)); random.shuffle(l); print(' '.join(map(str,l)))"); do
  got=$(curl "${H[@]}" -m 30 -X POST --data-binary "mkdir -p /workspace/claims/$JOB && mkdir /workspace/claims/$JOB/$c 2>/dev/null && echo GOT" "$HUB/sh")
  [ "$got" = GOT ] || continue
  FR="$((c*CH))-$((c*CH+CH-1))"
  log "chunk $c ($FR)"
  /workspace/blender/blender -b -P render.py -- --frames "$FR" --res "$RES" --samples "$SAMPLES" --device GPU --out /workspace/out_$JOB 2>&1 | while read -r line; do
    case "$line" in FRAME*) f=$(echo "$line" | awk '{print $2}'); n=$(printf "f_%04d.png" "$f")
      if [ "$HUB" != "http://127.0.0.1:8000" ]; then curl "${H[@]}" -m 300 -T "/workspace/out_$JOB/$n" "$HUB/f/o/$JOB/$n" >/dev/null && rm -f "/workspace/out_$JOB/$n"
      else mkdir -p /workspace/o/$JOB && mv "/workspace/out_$JOB/$n" "/workspace/o/$JOB/$n"; fi
      log "$line";; esac
  done
done
log "done"
