#!/usr/bin/env bash
# Make small, easily shareable review copies of the full-quality renders.
set -euo pipefail
cd "$(dirname "$0")/.."
for f in renders/*_hq.mp4; do
  out="${f%_hq.mp4}_small.mp4"
  ffmpeg -y -loglevel error -i "$f" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 192k "$out"
  echo "$out $(du -h "$out" | cut -f1)"
done
