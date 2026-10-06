#!/usr/bin/env bash
# tools/render.sh <Composition> <out.mp4>  — full-quality render (H.264, JPEG frames q95, final mix from the composition).
# Remotion's JPEG frames come out as full-range yuvj420p, which some phone/browser players refuse or show washed out,
# so the render is converted to standard limited-range yuv420p with faststart (audio copied untouched).
HS=${CHROME_PATH:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
B=(); [ -x "$HS" ] && B=(--browser-executable="$HS")
RAW="${2%.mp4}.raw.mp4"
npx remotion render src/index.ts "$1" "$RAW" "${B[@]}" --gl=angle --codec=h264 --crf=14 --jpeg-quality=95 --audio-bitrate=256k --concurrency=${CONC:-6} --log=error &&
  "$(dirname "$0")/fixrange.sh" "$RAW" "$2" && rm -f "$RAW"
