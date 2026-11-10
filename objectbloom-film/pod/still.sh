#!/usr/bin/env bash
# pod/still.sh "<frames>" <name> [res] [samples] [extra]  — render review stills on the pod's GPU and fetch them into out/<name>/
cd "$(dirname "$0")/.."
F="$1"; N="$2"; R="${3:-1920x1080}"; S="${4:-128}"; X="$5"
pod/pack.sh code >/dev/null
python3 pod/pod.py sh "rm -rf /workspace/o/$N /workspace/o/$N.tgz /workspace/o/$N.done" >/dev/null
python3 pod/pod.py bg "cd /workspace/p && /workspace/blender/blender -b -P render.py -- --frames $F --res $R --samples $S --device GPU --out /workspace/o/$N $X 2>&1 | grep -E 'FRAME|Error|Traceback|error' ; cd /workspace/o/$N && for f in f_*.png; do ffmpeg -v error -y -i \$f -q:v 2 \${f%.png}.jpg; done; tar czf ../$N.tgz *.jpg; touch ../$N.done" >/dev/null
for i in $(seq 1 120); do sleep 10; if python3 pod/pod.py sh "ls /workspace/o/$N.done 2>/dev/null" | grep -q done; then break; fi; done
python3 pod/pod.py sh "tail -n 40 /workspace/logs/\$(ls -t /workspace/logs | head -1) | grep -E 'FRAME|rror|Trace' | tail -n 12"
mkdir -p out/$N && python3 pod/pod.py get o/$N.tgz out/$N.tgz && tar xzf out/$N.tgz -C out/$N && ls out/$N | wc -l
