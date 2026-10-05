#!/usr/bin/env bash
# tools/stills.sh <Composition> <outdir> <frame> [frame...]  — render review stills (headless shell + ANGLE)
comp=$1; out=$2; shift 2; mkdir -p "$out"
HS=${CHROME_PATH:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
for fr in "$@"; do
  npx remotion still src/index.ts "$comp" "$out/${comp}_$fr.png" --frame=$fr --browser-executable="$HS" --gl=angle --log=error >/dev/null 2>&1 || echo "FAILED $fr"
done
