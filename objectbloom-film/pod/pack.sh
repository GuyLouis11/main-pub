#!/usr/bin/env bash
# pod/pack.sh [code]  — upload the project to the pod. "code" skips the dashboard frames (they rarely change).
cd "$(dirname "$0")/.."
if [ "$1" = code ]; then tar czf out/proj.tgz --exclude='film/assets/ui/ui_*.jpg' --exclude='film/assets/ui/seq' --exclude='__pycache__' film render.py tools/link_ui.py
else tar czf out/proj.tgz --exclude='film/assets/ui/seq' --exclude='__pycache__' film render.py tools/link_ui.py; fi
ls -la out/proj.tgz | awk '{print $5}'
python3 pod/pod.py put out/proj.tgz proj.tgz
python3 pod/pod.py sh 'mkdir -p /workspace/p && cd /workspace/p && tar xzf ../proj.tgz && python3 tools/link_ui.py'
