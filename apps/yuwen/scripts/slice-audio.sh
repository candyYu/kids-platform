#!/bin/bash
# 自动把 l01.mp3 切成独立的拼音片段
# 用法：./slice-audio.sh

cd "$(dirname "$0")/../public/audio"

INPUT="lessons/l01.mp3"
OUTPUT_DIR="slices/l01"

mkdir -p "$OUTPUT_DIR"

echo "正在检测静音点..."

# 1. 检测所有静音区间，得到声音段的起止时间
SEGMENTS=$(ffmpeg -i "$INPUT" -af silencedetect=n=-30dB:d=0.2 -f null - 2>&1 | \
  grep -E "silence_start|silence_end" | \
  awk '{print $NF}' | \
  paste - - | \
  awk '{print $1 " " $2}')

echo "检测到的静音区间："
echo "$SEGMENTS"

# 2. 计算每个声音段（静音区间之间的部分）
i=1
prev_end=0

echo ""
echo "正在切片..."

for line in $SEGMENTS; do
  silence_start=$(echo $line | cut -d' ' -f1)
  silence_end=$(echo $line | cut -d' ' -f2)
  
  # 上一个静音结束到这个静音开始，就是一个声音段
  if (( $(echo "$prev_end < $silence_start" | bc -l) )); then
    duration=$(echo "$silence_start - $prev_end" | bc -l)
    
    # 只保留时长 > 0.15s 的声音段
    if (( $(echo "$duration > 0.15" | bc -l) )); then
      printf "  片段 %02d: %.2f - %.2f (时长 %.2fs)\n" $i $prev_end $silence_start $duration
      
      # 切出来
      ffmpeg -y -i "$INPUT" -ss "$prev_end" -to "$silence_start" \
        -c copy "$OUTPUT_DIR/slice_$(printf %02d $i).mp3" 2>/dev/null
      
      i=$((i+1))
    fi
  fi
  
  prev_end=$silence_end
done

echo ""
echo "✅ 完成！共切成 $((i-1)) 个片段"
echo "目录: $OUTPUT_DIR/"
