#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
以【打印 PDF】为唯一权威源，重建 14 张拼音摘星卡结构。

为什么不用 docx / 人工核对稿：
  人工稿有真实遗漏（L4 拼一拼少 6 个音节、L9 生字漏“鱼”、L1 比一比配对错乱）。
  PDF 是孩子手上打印、老师打☆用的原件，用户明确“以 pdf 为准”。

数据源（必须先用 pdftotext 生成，保留声调和坐标）：
  pdftotext -bbox-layout -f N -l N "2026拼音摘星卡.pdf" /tmp/star-pdf/bN.html
  物理页 3..16 = 摘星卡第 1..14 课。

口径（用户确认）：
  · ☆数一律取 PDF 印刷声明（declaredStars / totalStars），即使声明数≠实际条目数
    （如 L1 准确认读印 14☆但卡面只有 12 个单韵母；L4 拼一拼印 64☆实际 58 个）。
  · 点读条目取 PDF 实际内容，有多少做多少，绝不凑数。
  · 轻声 ɑ/ɑ 规范化为 a（PDF 用 bɑ、zhɑ、lǎ bɑ、nǎi nɑi 这种轻声写法）。
  · j/q/x/y 后的 ü：PDF 已按小学拼写印成 u（jú、qù、xǔ、yú…），原样保留，不改写。

本脚本默认打印教师眼审清单；加 --emit-ts 写 cards.generated.ts。
"""
import re, sys, os, json

PDF_DIR = "/tmp/star-pdf"
PAGE_FOR_LESSON = {n: n + 2 for n in range(1, 15)}  # 课1→物理页3
LESSON_ID = {n: f"L{n:02d}" for n in range(1, 15)}
LESSON_ID[9] = "L08Y"                            # y w 沿用旧 id，不破坏既有音频/课程关联
TONES = "āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ"
SYLCHAR = set("abcdefghijklmnopqrstuvwxyzüɑ" + TONES)
CN_NUM = "一二三四五"

# ---- 读 bbox html，取 word 级 (y, x, text) ----
_WORD_RE = re.compile(
    r'<word xMin="([\d.]+)" yMin="([\d.]+)"[^>]*>([^<]*)</word>')

def words_of_page(pg):
    out = []
    html = open(os.path.join(PDF_DIR, f"b{pg}.html"), encoding="utf-8").read()
    for m in _WORD_RE.finditer(html):
        x, y, t = float(m.group(1)), float(m.group(2)), m.group(3)
        if t.strip():
            out.append((y, x, t))
    return out

def cluster_rows(ws, ylo, yhi, tol=7):
    """把 y 在 (ylo,yhi) 的 word 按视觉行聚合，行内按 x 排序。"""
    sel = sorted([(y, x, t) for y, x, t in ws if ylo < y < yhi],
                 key=lambda w: (w[0], w[1]))
    rows = []
    for y, x, t in sel:
        if rows and abs(y - rows[-1][0]) <= tol:
            rows[-1][1].append((x, t))
        else:
            rows.append([y, [(x, t)]])
    return [(round(y), [t for _, t in sorted(xs)]) for y, xs in rows]

def section_heads(ws):
    """识别 'N、…' 区块头，返回 [(y, 标题文本, 声明☆)]。
    PDF 把 “一、准确认读（共” 和 “14☆)” 拆成同 y 的多个 word，
    需以头 word 的 y 为锚，把同一视觉行（±7pt）所有 word 拼起来取☆。"""
    anchors = {}
    for y, x, t in ws:
        if re.match(rf"^[{CN_NUM}]、", t):
            anchors.setdefault(round(y), True)
    heads = []
    for hy in sorted(anchors):
        line_words = sorted(
            [(x, t) for y, x, t in ws if abs(y - hy) <= 7])
        text = "".join(t for _, t in line_words)
        heads.append((hy, text, _stars_from(text)))
    return heads

def norm_syl(t):
    """单音节规范化：NFC + ɡ(U+0261)→g + 轻声 ɑ→a。"""
    return t.replace("ɡ", "g").replace("ɑ", "a").strip()

def is_pinyin_token(t):
    # 必须先规范化再判定：PDF 用单-story ɡ(U+0261)，直接判会把 ɡé/ɡuō 误丢
    core = norm_syl(t).replace("—", "")
    return bool(core) and all(c in SYLCHAR for c in core)

_STAR_RE = re.compile(r"共\s*(\d+)\s*☆|(?:每个句子\s*)?(\d+)\s*☆")
def _stars_from(text):
    """优先取“共 N☆”（L14 每个句子3☆、共15☆，评分单元是5句=15）。"""
    m = re.search(r"共\s*(\d+)\s*☆", text)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)\s*☆", text)
    return int(m.group(1)) if m else None
_TOTAL_RE = re.compile(r"总计\s*(\d+)\s*☆")
_TITLE_RE = re.compile(r"拼音第(.+?)课\s*《\s*(.+?)\s*》")

def cn_to_int(s):
    m = {"一":1,"二":2,"三":3,"四":4,"五":5}
    if s in m: return m[s]
    if s.startswith("十"):
        return 10 + (m.get(s[1:], 0) if len(s) > 1 else 0)
    if s.endswith("十"):
        return m.get(s[0], 1) * 10
    if "十" in s:
        a, b = s.split("十")
        return m.get(a, 1) * 10 + m.get(b, 0)
    return int(s)

# 区块归类（按标题关键字）
NOTE_KW = ("秘诀", "背", "读一读")   # 口诀/背诵/课外阅读 → notes，不评分不点读
SENTENCE_KW = "读句子"           # L14 整句
PAIR_KW = "比一比"               # A—B 配对

def clean_sentence(words):
    """把一行/多行 word 拼成整句并切音节，剥标点与题号。"""
    """把一行/多行 word 拼成整句并切音节，剥标点与题号。
    word 间保留空格（PDF 每个 word 是独立音节），标点转空格，避免 le+xiǎo 粘连。"""
    joined = " ".join(words)
    joined = re.sub(r"[（(]\d+[）)]", " ", joined)   # 去（1）
    joined = re.sub(r"[。，,！!？?：:；;、…“”\"'（）()]", " ", joined)
    syls = []
    for frag in joined.split():
        frag = norm_syl(frag)
        if frag:
            syls.append(frag)
    return syls

# PDF 标题因字体空格不可靠，14 课标题全部按教学实际显式规范
TITLE_OVERRIDE = {
    1: "ɑoe", 2: "i u ü", 3: "bpmf", 4: "dtnl", 5: "ɡkh", 6: "jqx", 7: "zcs",
    8: "zh ch sh r", 9: "y w", 10: "ai ei ui", 11: "ao ou iu", 12: "ie üe er",
    13: "an en in un ün", 14: "ang eng ing ong",
}
# 区块里偶尔出现但不是“生字词”的汉字噪声
HANZI_NOISE = ("熟练", "比较熟练", "加油", "记得", "红笔", "我摘到", "总计",
               "摘星卡", "拼音第", "自己再练习", "（字）", "（词语）", "（句子）")

def is_hanzi_word(w):
    """纯汉字短词才算可点读生字；含标点/数字/书名号/签名的一律不是。"""
    w = w.strip()
    if not (1 <= len(w) <= 6):
        return False
    if not re.fullmatch(r"[一-鿿]+", w):
        return False
    return not any(n in w for n in HANZI_NOISE)

def merge_split_initials(pys):
    """合并 PDF 把一个音节拆成『单声母 + 韵母』的碎片（如 r ì→rì）。
    只在出现『单个辅音声母字符』时与后一片段相拼；正常多音节（每个都含元音）不动。"""
    INITIAL_CHARS = set("bpmfdtnlgkhjqxrzcsyw")
    out = []
    i = 0
    while i < len(pys):
        t = pys[i]
        if (len(t) == 1 and t in INITIAL_CHARS and i + 1 < len(pys)
                and pys[i + 1][:1] in "aāáǎàeēéěèoōóǒòiīíǐìuūúǔùüǖǘǚǜ"):
            out.append(t + pys[i + 1])
            i += 2
            continue
        out.append(t)
        i += 1
    return out

def parse_lesson(lesson):
    pg = PAGE_FOR_LESSON[lesson]
    ws = words_of_page(pg)
    alltext = " ".join(t for _, _, t in ws)
    title = TITLE_OVERRIDE[lesson]
    mtotal = _TOTAL_RE.search(alltext)
    total = int(mtotal.group(1)) if mtotal else None

    heads = section_heads(ws)
    sections, notes = [], []
    for i, (hy, htext, stars) in enumerate(heads):
        # 上下都留白 12pt：head 用 round(y) 去重，原始 yMin 可能略小，
        # 不留白会把下一区块头（如“三、认读生字”）吞进上一区块当汉字。
        ylo = hy + 12
        yhi = (heads[i + 1][0] - 12) if i + 1 < len(heads) else 10_000
        body_rows = cluster_rows(ws, ylo, yhi)
        # 区块显示名：去掉序号、☆声明括注
        name = re.sub(rf"^[{CN_NUM}]、", "", htext)
        name = re.sub(r"[（(][^（）()]*☆[^（）()]*[）)]", "", name).strip()

        # 是否为“口诀/背诵/课外阅读”非评分区块。
        # 注意“拼一拼，读一读”名字里也有“读一读”，必须排除（用去序号后的 name 判断）
        is_note = ("秘诀" in htext or "背" in htext
                   or name.startswith("读一读"))
        if is_note:
            # 口诀/背诵/读一读：头行 + 跨行正文，剥掉签名噪声（熟练/加油/括号）
            head = re.sub(rf"^[{CN_NUM}]、", "", htext)
            head = re.sub(r"(熟练|比较熟练|加油).*$", "", head)   # 头行尾部签名
            body_txt = " ".join(
                t for _, ts in body_rows for t in ts
                if not re.search(r"熟练|加油|比较|摘星卡|我摘到|记得|红笔", t)
                and t not in ("油", "加")
                and not re.fullmatch(r"[0-9（）()\s]+", t))
            note = (head + (" " + body_txt if body_txt else ""))
            note = re.sub(r"[（(]\s*[）)]", "", note)
            note = re.sub(r"\s+", "", note).strip("，。：:、")
            if note:
                notes.append(note)
            continue

        items = []
        if PAIR_KW in htext:
            for _, ts in body_rows:
                for w in ts:
                    if "—" in w:
                        a, b = w.split("—", 1)
                        a, b = norm_syl(a), norm_syl(b)
                        if a and b:
                            items.append({"kind": "py", "pair": True, "tokens": [a, b]})
        elif SENTENCE_KW in htext:
            # 按题号 (N) 聚合跨行整句；word 间用空格连，避免音节粘连
            cur = []
            def flush():
                if cur:
                    syls = clean_sentence(cur)
                    if syls:
                        items.append({"kind": "py", "tokens": syls})
                    cur.clear()
            for _, ts in body_rows:
                for t in ts:
                    if re.match(r"^[（(]\d+[）)]", t):
                        flush()
                    cur.append(t)
            flush()
        else:
            # 通用：拼音按视觉行成词（多音节连读）；汉字逐词（“妹妹、奶奶”按顿号拆）
            for _, ts in body_rows:
                pys = [norm_syl(w) for w in ts if is_pinyin_token(w)]
                pys = merge_split_initials(pys)
                if pys:
                    items.append({"kind": "py", "tokens": pys})
                for w in ts:
                    if is_pinyin_token(w):
                        continue
                    for piece in re.split(r"[、，,；;\s]+", w):
                        if is_hanzi_word(piece):
                            items.append({"kind": "hz", "tokens": [piece]})
        sections.append({"name": name, "declaredStars": stars, "items": items})

    return {"id": LESSON_ID[lesson], "lesson": lesson, "title": title,
            "totalStars": total, "sections": sections, "notes": notes}

def parse_all():
    return [parse_lesson(n) for n in range(1, 15)]

TS_TARGET = os.path.join(
    os.path.dirname(__file__), "..", "src", "data", "starCards", "cards.generated.ts")

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

def emit_ts(cards, path=TS_TARGET):
    L = []
    L.append("// 本文件由 scripts/extract-star-cards-pdf.py --emit-ts 生成，勿手改。")
    L.append("// 唯一数据源：2026拼音摘星卡.pdf（打印件，pdftotext -bbox-layout 提取）。")
    L.append("// ☆数照 PDF 印刷声明；点读条目照 PDF 实际内容（个别卡面☆与条目数本就不一致）。")
    L.append("import type { StarCard } from './types'")
    L.append("")
    L.append("export const starCards: StarCard[] = [")
    for c in cards:
        L.append("  {")
        L.append(f"    id: {js_str(c['id'])},")
        L.append(f"    lesson: {c['lesson']},")
        L.append(f"    title: {js_str(c['title'])},")
        L.append(f"    totalStars: {('null' if c['totalStars'] is None else c['totalStars'])},")
        L.append("    sections: [")
        for s in c["sections"]:
            ds = "null" if s["declaredStars"] is None else s["declaredStars"]
            L.append(f"    {{ name: {js_str(s['name'])}, declaredStars: {ds}, items: [")
            for it in s["items"]:
                pair = ", pair: true" if it.get("pair") else ""
                toks = ", ".join(js_str(t) for t in it["tokens"])
                L.append(f"      {{ kind: {js_str(it['kind'])}{pair}, tokens: [{toks}] }},")
            L.append("    ] },")
        L.append("    ],")
        notes = ", ".join(js_str(n) for n in c["notes"])
        L.append(f"    notes: [{notes}],")
        L.append("  },")
    L.append("]")
    L.append("")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L))

if __name__ == "__main__":
    cards = parse_all()
    if "--emit-ts" in sys.argv:
        emit_ts(cards)
        print("已生成", os.path.normpath(TS_TARGET))
    else:
        for c in cards:
            print(f"第{c['lesson']:>2}课《{c['title']}》 {c['id']} 卡面总☆ {c['totalStars']}")
            for s in c["sections"]:
                py = sum(len(i["tokens"]) for i in s["items"] if i["kind"] == "py")
                pair = sum(1 for i in s["items"] if i.get("pair"))
                hz = sum(1 for i in s["items"] if i["kind"] == "hz")
                tag = []
                if pair: tag.append(f"{pair}组配对/{pair*2}音节")
                elif py: tag.append(f"{py}音节")
                if hz: tag.append(f"{hz}汉字词")
                warn = ""
                if s["declaredStars"] is not None and not pair:
                    n_items = sum(len(i["tokens"]) for i in s["items"] if i["kind"]=="py") + hz
                    if s["declaredStars"] != n_items:
                        warn = f"  ⚠印{s['declaredStars']}☆ vs 实{n_items}条"
                print(f"   {s['name']}（印{s['declaredStars']}☆） {'/'.join(tag)}{warn}")
                for it in s["items"]:
                    pre = "〔对〕" if it.get("pair") else ("〔字〕" if it["kind"]=="hz" else "〔拼〕")
                    print("       ", pre, "-".join(it["tokens"]))
            for n in c["notes"]:
                print("    ·口诀/背诵:", n)
            print()
