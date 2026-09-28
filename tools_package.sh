#!/usr/bin/env bash
# Build handoff ZIPs (no node_modules, caches, renders-in-progress or secrets).
#  deliveries/gww-chapters-v1.zip   film/ only (chapters, tools, docs, real Flow clips, review MP4) — merges without touching the opening
#  deliveries/gww-full-project-v2.zip  hot-water-opening/ + film/
# Generated score WAVs are excluded from the chapters ZIP (regenerate: cd film && python3 tools/chapter_audio.py).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p deliveries
EXC=( -x "*/node_modules/*" "*/snapshots/*" "*/.hyperframes/*" "*/renders/parts/*" "*/renders/*_hq.mp4" "*/work-*" "*/.hf-transaction*" "*.env" "*/.env*" "*.placeholder" )
rm -f deliveries/gww-chapters-v1.zip deliveries/gww-full-project-v2.zip
zip -qr deliveries/gww-chapters-v1.zip film "${EXC[@]}" -x "film/ch*/assets/audio/*.wav"
zip -qr deliveries/gww-full-project-v2.zip hot-water-opening film "${EXC[@]}" -x "film/ch*/assets/audio/*.wav" "hot-water-opening/renders/*"
for z in deliveries/gww-chapters-v1.zip deliveries/gww-full-project-v2.zip; do echo "$z $(du -h $z | cut -f1) $(unzip -l $z | tail -1 | awk '{print $2}') files"; done
