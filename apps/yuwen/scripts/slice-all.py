#!/usr/bin/env python3
"""
批量切片所有 13 课的音频
用法：python3 slice-all.py
"""
import subprocess
import re
import os

LESSONS = [f"L{i:02d}" for i in range(1, 14)]

for lesson in LESSONS:
    num = lesson.replace("L", "")
    INPUT = f"public/audio/lessons/l{num}.mp3"
    OUTPUT_DIR = f"public/audio/slices/l{num}"
    
    if not os.path.exists(INPUT):
        print(f"⚠️  跳过 {lesson}: 文件不存在")
        continue
    
    if os.path.exists(OUTPUT_DIR) and len(os.listdir(OUTPUT_DIR)) > 0:
        print(f"⏭️  跳过 {lesson}: 已经切片过了")
        continue
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"\n🔍 {lesson} 正在检测静音点...")
    result = subprocess.run([
        "ffmpeg", "-i", INPUT,
        "-af", "silencedetect=n=-30dB:d=0.2",
        "-f", "null", "-"
    ], capture_output=True, text=True)

    silence_starts = []
    silence_ends = []

    for line in result.stderr.split("\n"):
        if "silence_start" in line:
            match = re.search(r"silence_start: ([\d.]+)", line)
            if match:
                silence_starts.append(float(match.group(1)))
        elif "silence_end" in line:
            match = re.search(r"silence_end: ([\d.]+)", line)
            if match:
                silence_ends.append(float(match.group(1)))

    # 提取声音段
    sound_segments = []
    
    # 第一个声音段
    if silence_starts and silence_starts[0] > 0:
        sound_segments.append((0, silence_starts[0]))
    
    # 中间的声音段
    for i in range(len(silence_ends) - 1):
        start = silence_ends[i]
        end = silence_starts[i + 1]
        if end - start > 0.15:
            sound_segments.append((start, end))

    print(f"  {lesson} 找到 {len(sound_segments)} 个声音段")

    # 切片
    for i, (start, end) in enumerate(sound_segments, 1):
        output = f"{OUTPUT_DIR}/slice_{i:02d}.mp3"
        subprocess.run([
            "ffmpeg", "-y", "-i", INPUT,
            "-ss", str(start), "-to", str(end),
            "-c", "copy", output
        ], capture_output=True)
        
        if i % 5 == 0:
            print(f"  ... {i}/{len(sound_segments)}")

    print(f"✅ {lesson} 完成！{len(sound_segments)} 个片段")

print("\n" + "="*50)
print("🎉 全部 13 课切片完成！")
print("="*50)
