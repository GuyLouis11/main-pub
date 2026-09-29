#!/usr/bin/env bash
# Render chapters (default: all built ones) and assemble them.  CLEAN=1 for the final picture (no scratch subtitles).
#   bash tools/render.sh [ch0 ch1 ...]     → renders/parts/chN.mp4 and renders/film_<chapters>.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
VARS='{"scratchVO":false}'
CHS=${@:-$(ls -d ch? | sort)}
mkdir -p renders/parts
for c in $CHS; do
  npx hyperframes render $c -f 30 -q standard -w 3 --variables "$VARS" -o renders/parts/$c.mp4 > renders/parts/$c.log 2>&1 || { echo "FAILED $c"; tail -5 renders/parts/$c.log; exit 1; }
  echo "rendered $c"
done
NAME=$(echo $CHS | tr ' ' '_')
for c in $CHS; do echo "file 'parts/$c.mp4'"; done > renders/list_$NAME.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i renders/list_$NAME.txt -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart renders/film_$NAME.mp4
echo "assembled renders/film_$NAME.mp4"
