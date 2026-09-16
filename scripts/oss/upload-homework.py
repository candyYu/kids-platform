#!/usr/bin/env python3
"""
上传当天作业到 OSS。

用法：
  export OSS_ACCESS_KEY_ID=...
  export OSS_ACCESS_KEY_SECRET=...
  ./upload-homework.py [作业文件路径]

默认读取桌面上的「作业-homework.txt」；不存在时自动从模板创建一份。
上传后自动匿名回读校验，并打印 pad 将拉取的地址。
"""
import hashlib
import os
import sys

from oss_common import PUBLIC_BASE, get_raw, put_object

KEY = "homework/homework.txt"
SUBJECTS = ("语文", "数学", "英语", "小提琴")
DEFAULT_FILE = os.path.expanduser("~/Desktop/作业-homework.txt")
TEMPLATE = os.path.join(os.path.dirname(__file__), "homework-template.txt")


def load_homework(path):
    if not os.path.exists(path):
        with open(TEMPLATE, "r", encoding="utf-8") as f:
            template = f.read()
        with open(path, "w", encoding="utf-8") as f:
            f.write(template)
        print(f"已在桌面创建模板：{path}")
        print("改完保存，再跑一次本脚本即可。")
        sys.exit(0)

    with open(path, "rb") as f:
        raw = f.read()
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]  # 去掉 Windows 记事本可能加的 BOM

    text = raw.decode("utf-8")
    bad = []
    for i, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if not s.startswith(SUBJECTS):
            bad.append((i, line))
    if bad:
        print("以下行格式不对（每行要以 语文/数学/英语/小提琴 开头），未上传：")
        for i, line in bad:
            print(f"  第{i}行: {line}")
        sys.exit(1)
    return raw


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_FILE
    data = load_homework(path)

    url = put_object(
        KEY,
        data,
        content_type="text/plain; charset=utf-8",
        cache_control="no-cache",
    )

    status, body, _ = get_raw(url)
    ok = status == 200 and hashlib.md5(body).hexdigest() == hashlib.md5(data).hexdigest()
    if not ok:
        sys.exit(f"上传后回读校验失败（HTTP {status}），请重试或检查防盗链设置。")

    print(f"✅ 作业已上传（{len(data)} 字节）")
    print(f"   {url}")
    print("   pad 重新打开/刷新宝宝学习乐园首页即可看到。")


if __name__ == "__main__":
    main()
