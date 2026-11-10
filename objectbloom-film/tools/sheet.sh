#!/usr/bin/env bash
# tools/sheet.sh <dir> <out.jpg> [cols]  — contact sheet of the PNG frames in a folder
c=${3:-4}; n=$(ls "$1"/f_*.png | wc -l); r=$(( (n + c - 1) / c ))
ffmpeg -v error -y -pattern_type glob -i "$1/f_*.png" -vf "scale=640:-1,tile=${c}x${r}" -frames:v 1 -q:v 3 "$2"
