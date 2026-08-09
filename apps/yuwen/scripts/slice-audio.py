#!/usr/bin/env python3
import subprocess
import re
import os

INPUT = "public/audio/lessons/l01.mp3"
OUTPUT_DIR = "public/audio/slices/l01"
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("🔍 正在检测静音点...")
result = subprocess.run([
    "ffmpeg", "-i", INPUT,
    "-af", "silencedetect=n=-30dB:d=0.2",
    "-f", "null", "-"
], capture_output=True, text=True)

# 提取所有 silence_start 和 silence_end
silence_starts = []
silence_ends = []

for line in result.stderr.split("\n"):
    if "silence_start" in line:
        t = float(re.search(r"silence_start: ([\d.]+)", line).group(1))
        silence_starts.append(t)
    elif "silence_end" in line:
        t = float(re.search(r"silence_end: ([\d.]+)", line).group(1))
        silence_ends.append(t)

print(f"  找到 {len(silence_starts)} 个静音区间")

# 声音段 = 上一个静音结束 到 这个静音开始
# 第一个声音段 = 0 到 第一个静音开始
sound_segments = []

# 第一个声音段：从 0 到第一个静音开始
if silence_starts and silence_starts[0] > 0:
    sound_segments.append((0, silence_starts[0]))

# 中间的声音段
for i in range(len(silence_ends) - 1):
    start = silence_ends[i]
    end = silence_starts[i + 1]
    if end - start > 0.15:  # 只保留 > 0.15s 的片段
        sound_segments.append((start, end))

print(f"  提取出 {len(sound_segments)} 个有效声音段")
print()

# 切出来
for i, (start, end) in enumerate(sound_segments, 1):
    duration = end - start
    print(f"  🎵 片段 {i:02d}: {start:.2f} - {end:.2f} ({duration:.2f}s)")
    
    output = f"{OUTPUT_DIR}/slice_{i:02d}.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", INPUT,
        "-ss", str(start), "-to", str(end),
        "-c", "copy", output
    ], capture_output=True)

print()
print(f"✅ 完成！{len(sound_segments)} 个片段保存在 {OUTPUT_DIR}/")
print()
print("现在打开 /match-slices.html 来匹配拼音")
