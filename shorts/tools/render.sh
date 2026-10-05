#!/usr/bin/env bash
# tools/render.sh <Composition> <out.mp4>  — full-quality render (H.264 CRF 16, JPEG frames q95, final mix from the composition)
HS=${CHROME_PATH:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
B=(); [ -x "$HS" ] && B=(--browser-executable="$HS")
npx remotion render src/index.ts "$1" "$2" "${B[@]}" --gl=angle --codec=h264 --crf=16 --jpeg-quality=95 --audio-bitrate=256k --concurrency=${CONC:-6} --log=error
