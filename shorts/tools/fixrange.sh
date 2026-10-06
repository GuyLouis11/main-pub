#!/usr/bin/env bash
# tools/fixrange.sh <in.mp4> <out.mp4> [crf]  — Remotion's full-range yuvj420p → standard limited-range yuv420p
# (BT.601 tags, same matrix as the source, so colors don't shift) + faststart, audio copied untouched
ffmpeg -v error -y -i "$1" -vf "scale=in_range=full:out_range=limited,format=yuv420p" -c:v libx264 -preset slow -crf "${3:-17}" \
  -profile:v high -colorspace smpte170m -color_primaries smpte170m -color_trc smpte170m -color_range tv -c:a copy -movflags +faststart "$2"
