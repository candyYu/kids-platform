#!/bin/bash
# dev.sh — 一键起 kids-platform 三个 app（web + music + yuwen）
# 用法: ./dev.sh
# 停止: Ctrl+C（kill 整个进程组）

set -e
cd "$(dirname "$0")"

NODE=/opt/homebrew/bin/node
LOG_DIR=.dev-logs
mkdir -p "$LOG_DIR"

cleanup() {
  echo ""
  echo ">>> 停止所有 dev server..."
  pkill -P $$ 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# 启动入口站 web (5173)
echo ">>> 启动 web 入口站 (5173)..."
(cd apps/web && $NODE node_modules/vite/bin/vite.js > "../$LOG_DIR/web.log" 2>&1) &
WEB_PID=$!
echo "    web PID=$WEB_PID 日志=$LOG_DIR/web.log"

# 启动 music (5174)
echo ">>> 启动 music app (5174)..."
(cd apps/music && $NODE node_modules/vite/bin/vite.js > "../$LOG_DIR/music.log" 2>&1) &
MUSIC_PID=$!
echo "    music PID=$MUSIC_PID 日志=$LOG_DIR/music.log"

# 启动 yuwen (5175)
echo ">>> 启动 yuwen app (5175)..."
(cd apps/yuwen && $NODE node_modules/vite/bin/vite.js > "../$LOG_DIR/yuwen.log" 2>&1) &
YUWEN_PID=$!
echo "    yuwen PID=$YUWEN_PID 日志=$LOG_DIR/yuwen.log"

echo ""
echo "✅ 三个 app 已启动:"
echo "   入口站 (宝宝学习乐园): http://127.0.0.1:5173"
echo "   music   (小小音乐家):  http://127.0.0.1:5174"
echo "   yuwen   (小小语文家):  http://127.0.0.1:5175"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

wait
