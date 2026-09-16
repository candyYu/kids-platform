#!/usr/bin/env python3
"""
上传当天作业到 OSS。

用法：
  export OSS_ACCESS_KEY_ID=...
  export OSS_ACCESS_KEY_SECRET=***  ./upload-homework.py [作业文件路径]

默认读取桌面上的「作业-homework.txt」；不存在时自动从模板创建一份。
上传后自动匿名回读校验，并打印 pad 将拉取的地址。

作业格式（支持多行块，和老师真实作业格式一致）：
  学科单独成行，下面若干行都是这科的内容；直到下一个学科行为止。
  学科也可以直接在同一行写内容。例如：

      语文
      1.复习第一单元生字
      2.读摘星卡第1课三遍
      数学
      1.口算第12页
      英语 读pad上英语5分钟
      小提琴 持弓练习20分钟

  # 开头注释、空行忽略。
"""
import hashlib
import os
import re
import sys

from oss_common import PUBLIC_BASE, get_raw, put_object

KEY = "homework/homework.txt"
SUBJECTS = ("语文", "数学", "英语", "小提琴")
DEFAULT_FILE = os.path.expanduser("~/Desktop/作业-homework.txt")
TEMPLATE = os.path.join(os.path.dirname(__file__), "homework-template.txt")
SUBJECT_RE = re.compile(r"^(语文|数学|英语|小提琴)(?:[ \t]+(.*))?$")
# 摘星卡直达链接：摘星卡第N课 / 摘星卡 N 课
STARCARD_RE = re.compile(r"摘星卡第?\s*(\d+)\s*课")


def parse_homework(text):
    """
    返回 (entries, errors, warnings)。
    解析规则必须与 web app 客户端保持一致（见设计文档）。
    """
    blocks = []  # [subject, [lines]]
    cur = None
    orphans = []
    warnings = []
    for i, raw in enumerate(text.splitlines(), 1):
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        m = SUBJECT_RE.match(stripped)
        if m:
            cur = [m.group(1), []]
            blocks.append(cur)
            inline = (m.group(2) or "").strip()
            if inline:
                cur[1].append(inline)
            continue
        if cur is None:
            orphans.append((i, raw))
            continue
        cur[1].append(stripped)

    errors = [f"  第{i}行没有归属学科（上面要先有 语文/数学/英语/小提琴 行）: {l}"
              for i, l in orphans]
    entries = []
    for subj, lines in blocks:
        if not lines:
            warnings.append(f"「{subj}」下面没有内容，已跳过（这科今天没作业）")
            continue
        content = "\n".join(lines)
        card = None
        mm = STARCARD_RE.search(content)
        if mm:
            card = int(mm.group(1))
        entries.append((subj, content, card))
    # 全空文件/纯注释 → entries 为空属正常（今天没有作业），不报错
    return entries, errors, warnings


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
    entries, errors, warnings = parse_homework(text)
    if errors:
        print("作业文件有问题，未上传：")
        for e in errors:
            print(e)
        sys.exit(1)
    for w in warnings:
        print("⚠️ ", w)

    if not entries:
        # 全空/纯注释：允许上传，pad 首页将显示“今天没有作业”
        print("  （文件里没有有效作业，将上传为“今天没有作业”）")
    for subj, content, card in entries:
        first = content.splitlines()[0]
        more = f" …(共{len(content.splitlines())}条)" if chr(10) in content else ""
        link = f"  🎴→摘星卡第{card}课" if card else ""
        print(f"  [{subj}] {first}{more}{link}")
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

    print(f"\n✅ 作业已上传（{len(data)} 字节）")
    print(f"   {url}")
    print("   pad 重新打开/刷新宝宝学习乐园首页即可看到。")


if __name__ == "__main__":
    main()
