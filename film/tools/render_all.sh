#!/usr/bin/env bash
# Render the opening + all chapters (review variant with SCRATCH VO subtitles unless CLEAN=1), then assemble.
set -euo pipefail
cd "$(dirname "$0")/.."
VARS='{"scratchVO":true}'; SUF=review
if [ "${CLEAN:-0}" = "1" ]; then VARS='{"scratchVO":false}'; SUF=clean; fi
mkdir -p renders/parts
( cd ../hot-water-opening && npx hyperframes render -f 30 -q standard -w 3 --variables "$VARS" -o ../film/renders/parts/00_opening_$SUF.mp4 ) > renders/parts/00.log 2>&1
for c in ch1 ch2 ch3 ch4 ch5 ch6; do
  npx hyperframes render $c -f 30 -q standard -w 3 --variables "$VARS" -o renders/parts/${c}_$SUF.mp4 > renders/parts/$c.log 2>&1
  echo "rendered $c"
done
ls renders/parts/*_$SUF.mp4 | sort | sed "s/^/file '..\/..\//; s/$/'/" > renders/parts/list_$SUF.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i renders/parts/list_$SUF.txt -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart renders/film_v1_${SUF}_small.mp4
echo "assembled renders/film_v1_${SUF}_small.mp4"
