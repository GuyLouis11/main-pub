#!/usr/bin/env bash
# Runs on the hub pod: lays the titles over the rendered frames, adds the soundtrack, encodes the deliverables.
# post/assemble.sh <frames dir> <out name>
set -e
cd /workspace/p
F="$1"; N="$2"; O=/workspace/deliver; mkdir -p $O
[ -f /workspace/ov4k/o_0959.png ] || python3 post/overlays.py --res 3840x2160 --anchors post/anchors.json --out /workspace/ov4k
# master: 4K ProRes-quality H.264 at a high bitrate, a 1080p web copy, and a 15 s vertical cut for social
ffmpeg -v error -y -framerate 24 -i $F/f_%04d.png -framerate 24 -i /workspace/ov4k/o_%04d.png -i post/mix.wav \
  -filter_complex "[0:v][1:v]overlay=format=auto,format=yuv420p[v]" -map "[v]" -map 2:a \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level 5.1 -x264-params "aq-mode=3" -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a aac -b:a 320k -movflags +faststart -shortest $O/${N}_4K.mp4
ffmpeg -v error -y -i $O/${N}_4K.mp4 -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 256k -movflags +faststart $O/${N}_1080p.mp4
# vertical: frames 432-792 (18-33 s: interface, city, night) cropped to 9:16 around the action, with its own fade
ffmpeg -v error -y -ss 18 -t 15 -i $O/${N}_4K.mp4 -vf "crop=1215:2160:'min(max(0, iw*0.62-607), iw-1215)':0,scale=1080:1920:flags=lanczos,fade=t=in:st=0:d=0.4,fade=t=out:st=14.2:d=0.8" \
  -af "afade=t=in:st=0:d=0.3,afade=t=out:st=13.8:d=1.2" -c:v libx264 -preset slow -crf 18 -c:a aac -b:a 256k -movflags +faststart $O/${N}_vertical.mp4
ls -la $O
