#!/usr/bin/env python3
"""
拼音摘星卡：录音转码 + 上传 OSS + PDF 上传。

两步走（中间留人工抽听，避免转码事故）：

第一步：转码（不需要 Key，不上传）
  ./upload-star-cards.py transcode
  → 把桌面「2026拼音摘星卡」文件夹里的 14 个录音
    统一转成 64kbps 单声道 m4a，输出到 /tmp/star-cards-audio/
  → 请抽听第5、7课（原来的大 wav）和任意一课 m4a，确认没转坏

第二步：上传（需要环境变量给 Key）
  export OSS_ACCESS_KEY_ID=...
  export OSS_ACCESS_KEY_SECRET=...
  ./upload-star-cards.py upload
  → 上传 14 个转好的 m4a 到 star-cards/audio/star-card-lNN.m4a
  → 上传 PDF 到 star-cards/2026拼音摘星卡.pdf
  → 每个文件用 Range 请求验活（206/200）

另有：
  ./upload-star-cards.py upload-pdf        只传 PDF
  ./upload-star-cards.py transcode --only 5,7   只转指定课次（复验用）
"""
import os
import re
import subprocess
import sys

from oss_common import get_raw, put_object

SRC_DIR = os.path.expanduser("~/Desktop/2026拼音摘星卡")
OUT_DIR = "/tmp/star-cards-audio"
PDF_NAME = "2026拼音摘星卡.pdf"


def find_ffmpeg():
    cands = [
        "/opt/homebrew/opt/ffmpeg@4/bin/ffmpeg",
        "/opt/homebrew/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
    ]
    for c in cands:
        if os.path.exists(c):
            return c
    p = subprocess.run(["bash", "-lc", "command -v ffmpeg"], capture_output=True, text=True)
    if p.stdout.strip():
        return p.stdout.strip()
    sys.exit("找不到 ffmpeg")


def source_files():
    """返回 [(课次int, 源文件路径)]，按课次排序。"""
    out = []
    for name in os.listdir(SRC_DIR):
        m = re.match(r"拼音第(\d+)课摘星卡\.(m4a|wav)$", name)
        if m:
            out.append((int(m.group(1)), os.path.join(SRC_DIR, name)))
    return sorted(out)


def do_transcode(only=None):
    os.makedirs(OUT_DIR, exist_ok=True)
    ffmpeg = find_ffmpeg()
    files = source_files()
    if only:
        wanted = {int(x) for x in only.split(",") if x.strip()}
        files = [x for x in files if x[0] in wanted]
    if not files:
        sys.exit(f"在 {SRC_DIR} 没找到摘星卡录音")

    for n, src in files:
        dst = os.path.join(OUT_DIR, f"star-card-l{n:02d}.m4a")
        cmd = [
            ffmpeg, "-y", "-i", src,
            "-vn", "-ac", "1", "-c:a", "aac", "-b:a", "64k",
            "-movflags", "+faststart",
            dst,
        ]
        p = subprocess.run(cmd, capture_output=True, text=True)
        if p.returncode != 0:
            sys.exit(f"转码失败 第{n}课:\n{p.stderr[-800:]}")
        size = os.path.getsize(dst) / 1e6
        print(f"  第{n:>2}课 → {os.path.basename(dst)} ({size:.1f} MB)")
    print(f"\n✅ 转码完成，输出目录：{OUT_DIR}")
    print("请抽听确认（重点第5、7课），没问题后执行 upload。")


def check_live(url):
    status, _, headers = get_raw(url, byte_range="bytes=0-0")
    ctype = headers.get("Content-Type", "")
    if status not in (200, 206):
        return False, f"HTTP {status}"
    return True, ctype


def do_upload():
    files = sorted(
        os.path.join(OUT_DIR, f)
        for f in os.listdir(OUT_DIR) if f.startswith("star-card-") and f.endswith(".m4a")
    )
    if len(files) != 14:
        sys.exit(f"应转好 14 个 m4a，实际 {len(files)} 个。请先跑 transcode。")

    for path in files:
        name = os.path.basename(path)
        with open(path, "rb") as f:
            data = f.read()
        key = f"star-cards/audio/{name}"
        url = put_object(key, data, content_type="audio/mp4", cache_control="public, max-age=31536000, immutable")
        ok, info = check_live(url)
        if not ok:
            sys.exit(f"验活失败 {url}：{info}")
        print(f"✅ {name} ({len(data)/1e6:.1f} MB) [{info}]")

    do_upload_pdf(announce=False)


def do_upload_pdf(announce=True):
    pdf = os.path.join(SRC_DIR, PDF_NAME)
    if not os.path.exists(pdf):
        if announce:
            sys.exit(f"找不到 {pdf}")
        print("⚠️  未找到 PDF，跳过。")
        return
    with open(pdf, "rb") as f:
        data = f.read()
    key = f"star-cards/{PDF_NAME}"
    url = put_object(key, data, content_type="application/pdf", cache_control="public, max-age=86400")
    ok, info = check_live(url)
    if not ok:
        sys.exit(f"PDF 验活失败 {url}：{info}")
    print(f"✅ {PDF_NAME} ({len(data)/1e6:.2f} MB) [{info}]")
    print(f"   {url}")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cmd = sys.argv[1]
    if cmd == "transcode":
        only = None
        if len(sys.argv) >= 3 and sys.argv[2] == "--only" and len(sys.argv) >= 4:
            only = sys.argv[3]
        do_transcode(only)
    elif cmd == "upload":
        do_upload()
    elif cmd == "upload-pdf":
        do_upload_pdf()
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
