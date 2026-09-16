#!/usr/bin/env python3
"""
从教师原件 2026摘星卡.docx 提取 14 课摘星卡结构化数据（供眼审，不直接上线）。

docx 版式噪声（教师用浮动文本框/多列表格排版）：
- 同一逻辑段落里会串入浮动框文字（红笔提示、上一课尾巴、标题）。
- 表格单元格内多个音节无空格粘连（dǔtǔná...），需按声母边界切分。
- 原文混用异体拉丁字符 ɡ(U+0261)=g、ɑ(U+0251)=a。
本脚本只做"机械提取 + 自动核对"，不猜测内容；
所有『声明☆数 ≠ 实际音节数』和切分存疑的条目都在审计报告里标 ⚠️，
必须教师逐课眼审后才允许写入 app 数据。

输出（/tmp/star-extract/）：
  star-cards.preview.json   结构化数据（含 needs_review 标记）
  audit.md                  人读核对清单
"""
import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

DOCX = os.path.expanduser(
    "~/Desktop/2026拼音摘星卡/2026摘星卡.docx")
OUT_DIR = "/tmp/star-extract"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"

# ---- 文本规范化 ----
NORMALIZE = {"ɡ": "g", "ɑ": "a"}

def norm(s: str) -> str:
    for k, v in NORMALIZE.items():
        s = s.replace(k, v)
    return s

# 声母（长的在前保证 zh/ch/sh 优先）；零声母音节不以此开头
INITIALS = ["zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l",
            "g", "k", "h", "j", "q", "x", "r", "z", "c", "s", "y", "w"]
# 合法韵母（摘星卡范围内出现的）
FINALS = [
    "a", "o", "e", "i", "u", "ü", "er",
    "ai", "ei", "ui", "ao", "ou", "iu", "ie", "üe",
    "an", "en", "in", "un", "ün", "ang", "eng", "ing", "ong",
]
TONE_MARKS = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ"

# 带调/不带调元音字符类（ü 及其四调、a o e i u 四调）
VOWELS = "aoeiuüāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ"
# 一个音节 = 可选声母 + 韵母；韵母含复韵母/鼻韵母或单元音（带调字符各自合法）
SYLL_RE = re.compile(
    r"(?:zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?"
    r"(?:üe|er|ai|ei|ui|ao|ou|iu|ie|ang|eng|ing|ong|an|en|in|un|[" + VOWELS + r"])"
)

def split_glued(token: str):
    """把无空格粘连的音节串切开，返回 (音节列表, 是否完全可信)。
    每个合法音节应恰好含 0 或 1 个带调元音（轻声 0 个）。"""
    token = norm(token.strip())
    out, pos, ok = [], 0, True
    while pos < len(token):
        m = SYLL_RE.match(token, pos)
        if not m or m.end() == pos:
            ok = False
            pos += 1
            continue
        out.append(m.group(0))
        pos = m.end()
    # 带调数校验：一个音节最多一个调号
    for syl in out:
        if sum(1 for ch in syl if ch in TONE_MARKS) > 1:
            ok = False
    return out, ok

def words_from_line(line: str):
    """一行文本 → 条目列表 [{kind: py/hz/text, tokens:[...]}]。
    py：拼音词，tokens 为音节（无空格粘连按声母边界切）；
    hz：生字词（汉字，点读走 speakHanzi 链）；text：其他不发音文本。
    两个及以上空格/制表为条目间隔。"""
    line = norm(line).replace("[T]", "").strip()
    # 表格格内可能整格是对比组（ā—ōǎ—é）：先在破折号处强制拆成独立条目
    line = re.sub(r"\s*[—–]\s*", "  ", line)
    items, unsure = [], False
    for chunk in re.split(r"\s{2,}|\t+", line):
        chunk = chunk.strip()
        if not chunk:
            continue
        # 含拼音字符（含带调元音）且不含汉字 → 拼音条目
        if re.search(r"[a-zü" + TONE_MARKS + r"]", chunk) and not re.search(r"[一-鿿]", chunk):
            # 去词边标点
            cleaned = re.sub(r"[，。,；;：:、！!？?（）()]+", "", chunk).strip()
            if re.search(r"\s", cleaned):
                # 词内音节本来就有空格分隔，原样保留，绝不走粘连切分
                tokens = cleaned.split()
            else:
                tokens, ok = split_glued(cleaned)
                unsure = unsure or not ok
            items.append({"kind": "py", "tokens": [t for t in tokens if t]})
        elif re.fullmatch(r"[一-鿿（）()、]+", chunk):
            items.append({"kind": "hz", "tokens": [chunk]})
        else:
            items.append({"kind": "text", "tokens": [chunk]})
    return items, unsure

# ---- docx 解析 ----
def load_blocks():
    """按文档顺序返回 (kind, payload)：kind=para/tbl。"""
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    body = root.find(W + "body")
    blocks = []
    for child in body:
        if child.tag == W + "p":
            txt = "".join(t.text or "" for t in child.iter(W + "t"))
            blocks.append(("para", txt))
        elif child.tag == W + "tbl":
            grid = []
            for tr in child.iter(W + "tr"):
                row = []
                for tc in tr.iter(W + "tc"):
                    txt = "".join(t.text or "" for t in tc.iter(W + "t")).strip()
                    has_img = any(True for _ in tc.iter(A + "blip"))
                    row.append((txt, has_img))
                grid.append(row)
            blocks.append(("tbl", grid))
    return blocks

CN = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
      "六": 6, "七": 7, "八": 8, "九": 9}

def cn_num(s):
    if s == "十":
        return 10
    if len(s) == 2 and s[0] == "十":
        return 10 + CN.get(s[1], 0)
    if len(s) == 2 and s[1] == "十":
        return CN.get(s[0], 0) * 10
    if len(s) == 3:
        return CN.get(s[0], 0) * 10 + CN.get(s[2], 0)
    return CN.get(s)

LESSON_TITLE_RE = re.compile(r"拼音第([一二三四五六七八九十]{1,3})课[^《\n]{0,12}《(.+?)》")
# 区块标题：「一、名字（共 N☆)」名字在「（」前截断；无☆数时名字允许含中文冒号提示
SECTION_HEAD_RE = re.compile(
    r"([一二三四五])、\s*(.+?)\s*(?:[（(]\s*共\s*(\d+)\s*☆?\s*[)）])?\s*[)）]?\s*$")

def build():
    blocks = load_blocks()
    # 先定位每课起点 block 下标
    marks = []
    for i, (kind, payload) in enumerate(blocks):
        if kind != "para":
            continue
        m = LESSON_TITLE_RE.search(payload)
        if m:
            marks.append((cn_num(m.group(1)), i, norm(payload), m.group(2)))
    lessons = []
    for k, (num, start, title, title_text) in enumerate(marks):
        end = marks[k + 1][1] if k + 1 < len(marks) else len(blocks)
        total_m = re.search(r"总计\s*(\d+)\s*☆", title)
        total = int(total_m.group(1)) if total_m else None
        lesson = {
            "lesson": num,
            "id": "L08Y" if num == 9 else f"L{num:02d}",
            "title": title_text.strip(),
            "totalStars": total,
            "sections": [],
            "notes": [],          # 不发音的提示文本（秘诀/儿歌/签名行）
            "needsReview": [],
        }
        cur = None
        pending_tables = []   # 标题段落之前先出现的表格（第4课浮动排版）
        for i in range(start + 1, end):
            kind, payload = blocks[i]
            if kind == "tbl":
                if cur is None:
                    pending_tables.append(payload)
                else:
                    for row in payload:
                        for cell_txt, has_img in row:
                            if not cell_txt:
                                if has_img:
                                    cur["imageCells"] += 1
                                continue
                            items, unsure = words_from_line(cell_txt)
                            cur["items"].extend(items)
                            if unsure:
                                lesson["needsReview"].append(f"粘连音节切分存疑：{cell_txt}")
                continue
            # 段落
            line = norm(payload).strip()
            if not line:
                continue
            # 浮动串位：剥掉红笔提示前缀 / 标题已另起 / 签名残片
            line = re.sub(r"^记得把读错的.*?红笔圈一圈。?", "", line).strip()
            line = re.sub(r"拼音第[一二三四五六七八九十]{1,3}课.*$", "", line).strip()
            if not line:
                continue
            hm = re.match(r"\s*([一二三四五])、", line)
            if hm:
                stars = re.search(r"[（(]\s*共\s*(\d+)\s*☆?\s*[)）]", line)
                name_part = re.split(r"[（(]", line, maxsplit=1)[0]
                name = re.sub(r"^[一二三四五]、\s*", "", name_part).strip()
                cur = {"name": name,
                       "declaredStars": int(stars.group(1)) if stars else None,
                       "items": [], "imageCells": 0}
                lesson["sections"].append(cur)
                # 先收下悬而未决的表格（其逻辑归属通常就是新区块，如第4课 64☆表）
                for tbl in pending_tables:
                    for row in tbl:
                        for cell_txt, has_img in row:
                            if not cell_txt:
                                if has_img:
                                    cur["imageCells"] += 1
                                continue
                            items, unsure = words_from_line(cell_txt)
                            cur["items"].extend(items)
                            if unsure:
                                lesson["needsReview"].append(f"粘连音节切分存疑：{cell_txt}")
                pending_tables = []
                # 标题后粘连正文（「三、认读生字（共5☆) 爸爸 妈妈」「一、拼一拼（共54☆) sī ɡuā …」）
                tail = line[stars.end():] if stars else re.sub(r"^[一二三四五]、[^（(]*", "", line)
                tail = tail.strip(" ）)。，,")
                if tail:
                    items, u = words_from_line(tail)
                    cur["items"].extend(items)
                continue
            # 噪声行：签名/熟练程度行 → 丢弃
            if re.search(r"(我摘到|熟练（|比较熟练|加油\s*[（(]|自己再练习两组)", line):
                continue
            # 无☆数的中文标题行（秘诀/背诵）→ 不发音提示区块
            is_note_head = bool(re.match(r"[一二三四五]、", line)) is False and (
                "秘诀" in line or "背诵" in line or "背儿歌" in line)
            if cur is None:
                if re.search(r"[a-zü" + TONE_MARKS + r"]", line) and not re.search(r"[一-鿿]", line):
                    lesson["needsReview"].append(f"区块外拼音行：{line[:60]}")
                else:
                    lesson["notes"].append(line)
                continue
            items, unsure = words_from_line(line)
            has_read = any(it["kind"] in ("py", "hz") for it in items)
            note_like = cur["declaredStars"] is None
            if not has_read or note_like:
                lesson["notes"].append(line)
            else:
                cur["items"].extend(items)
                if unsure:
                    lesson["needsReview"].append(f"粘连音节切分存疑：{line[:60]}")
        if pending_tables:
            lesson["needsReview"].append(f"{len(pending_tables)} 个表格未找到归属区块")
        # 满☆有时在后续段落（第 9-14 课浮动排版），在本课文本里补找
        if lesson["totalStars"] is None:
            for j in range(start + 1, end):
                k2, p2 = blocks[j]
                if k2 == "para":
                    tm = re.search(r"总计\s*(\d+)\s*☆", p2)
                    if tm:
                        lesson["totalStars"] = int(tm.group(1))
                        break
        lessons.append(lesson)
    return lessons

def section_counts(s):
    py = [it for it in s["items"] if it["kind"] == "py"]
    hz = [it for it in s["items"] if it["kind"] == "hz"]
    syl = sum(len(it["tokens"]) for it in py)
    return len(py), syl, len(hz)

def audit(lessons):
    lines = ["# 拼音摘星卡 14 课提取核对清单（教师眼审用）", "",
             "说明：每区块列『拼音词数 / 音节总数』与卡面声明☆数；",
             "声明☆是评分依据（单字认读区可能按音节、词语区按词），不一致都会标 ⚠️。", ""]
    for ls in lessons:
        lines.append(f"## 第{ls['lesson']}课《{ls['title']}》 id={ls['id']} 满☆={ls['totalStars']}")
        sec_sum = 0
        for s in ls["sections"]:
            py_n, syl_n, hz_n = section_counts(s)
            declared = s["declaredStars"]
            sec_sum += declared or 0
            flags = []
            if declared is not None and declared not in (py_n, syl_n):
                flags.append(f"⚠️ 声明{declared}☆ 既不等于词数{py_n}也不等于音节数{syl_n}")
            preview = "　".join(
                "·".join(it["tokens"]) if it["kind"] == "py" else f"〔{it['tokens'][0]}〕"
                for it in s["items"][:10])
            if len(s["items"]) > 10:
                preview += " …"
            head = f"- 【{s['name']}】拼音词{py_n} / 音节{syl_n}"
            if hz_n:
                head += f" / 生字词{hz_n}"
            head += f"（卡面声明 {declared}☆）"
            lines.append(head)
            if flags:
                lines.append("  " + "；".join(flags))
            lines.append(f"    {preview}")
            if s["imageCells"]:
                lines.append(f"    （另有 {s['imageCells']} 个图片格，文字未提取，多为配图）")
            if s.get("inlineNote"):
                lines.append(f"    区块后粘连文本：{s['inlineNote'][:60]}")
        if ls["totalStars"] is not None and sec_sum and sec_sum != ls["totalStars"]:
            lines.append(f"- ⚠️ 各区块☆合计 {sec_sum} ≠ 卡面总计 {ls['totalStars']}")
        for n in ls["notes"]:
            lines.append(f"- 〔不发音〕{n[:90]}")
        for r in ls["needsReview"]:
            lines.append(f"- ⚠️ 待审：{r}")
        lines.append("")
    return "\n".join(lines)

def to_ts(lessons, path):
    """生成 yuwen app 数据文件。"""
    NOISE = re.compile(r"(熟练（|比较熟练|加油\s*[（(]|我摘到|红笔圈|自己再练习两组)")
    out = ["// 本文件由 scripts/extract-star-cards.py --emit-ts 生成，勿手改。",
           "import type { StarCard } from './types'",
           "",
           "export const starCards: StarCard[] = ["]
    for ls in lessons:
        secs = []
        for s in ls["sections"]:
            items = []
            for it in s["items"]:
                toks = "[" + ", ".join(json.dumps(t, ensure_ascii=False) for t in it["tokens"]) + "]"
                items.append("      { kind: %s, tokens: %s }" % (json.dumps(it["kind"]), toks))
            secs.append("    { name: %s, declaredStars: %s, items: [\n%s\n    ] }" % (
                json.dumps(s["name"], ensure_ascii=False),
                "null" if s["declaredStars"] is None else s["declaredStars"],
                ",\n".join(items)))
        notes = [n for n in ls["notes"] if not NOISE.search(n)]
        out.append("  {\n"
                   "    id: %s,\n"
                   "    lesson: %d,\n"
                   "    title: %s,\n"
                   "    totalStars: %s,\n"
                   "    sections: [\n%s\n    ],\n"
                   "    notes: [%s],\n"
                   "  }," % (
                       json.dumps(ls["id"]), ls["lesson"],
                       json.dumps(ls["title"], ensure_ascii=False),
                       "null" if ls["totalStars"] is None else ls["totalStars"],
                       ",\n".join(secs),
                       ", ".join(json.dumps(n, ensure_ascii=False) for n in notes)))
    out.append("]")
    out.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("wrote", path)

if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    lessons = build()
    if "--emit-ts" in sys.argv:
        repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        to_ts(lessons, os.path.join(repo, "apps/yuwen/src/data/starCards/cards.generated.ts"))
    with open(os.path.join(OUT_DIR, "star-cards.preview.json"), "w", encoding="utf-8") as f:
        json.dump(lessons, f, ensure_ascii=False, indent=2)
    report = audit(lessons)
    with open(os.path.join(OUT_DIR, "audit.md"), "w", encoding="utf-8") as f:
        f.write(report)
    # 终端摘要
    for ls in lessons:
        py_n = sum(section_counts(s)[0] for s in ls["sections"])
        syl = sum(section_counts(s)[1] for s in ls["sections"])
        warns = len(ls["needsReview"])
        print(f"L{ls['lesson']:>2} {ls['title']:<12} 满☆{str(ls['totalStars']):>3} "
              f"区块{len(ls['sections'])} 词{py_n:>3} 音节{syl:>3} 待审{warns}")
