#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
rm -rf "$ROOT/frames"
python3 "$ROOT/src/build_frames.py"
ffmpeg -y -framerate 30 -i "$ROOT/frames/frame_%04d.png" -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart "$ROOT/exports/tradermind-intro.mp4"
ffmpeg -y -framerate 30 -i "$ROOT/frames/frame_%04d.png" -c:v libvpx-vp9 -b:v 2M -pix_fmt yuv420p "$ROOT/exports/tradermind-intro.webm"
printf '\nExports:\n'; ls -lh "$ROOT/exports"; ffprobe -v error -show_entries format=duration:stream=width,height,codec_name,r_frame_rate -of default=noprint_wrappers=1 "$ROOT/exports/tradermind-intro.mp4"
