#!/usr/bin/env python3
"""
一次性脚本：给 OSS bucket 配置 CORS，让 pad/浏览器能 fetch 作业文本。
（音频/视频用 <audio>/<video> 标签不受 CORS 限制；作业是 fetch，必须配。）

安全策略：先读现有 CORS 规则，只在缺我们的规则时追加一条，绝不覆盖已有配置。
写完立刻回读 ?cors 校验，配置没真正生效会明确报错退出，不假装成功。

用法：
  export OSS_ACCESS_KEY_ID=...
  export OSS_ACCESS_KEY_SECRET=...
  ./setup-cors.py
"""
import sys
import xml.etree.ElementTree as ET

from oss_common import BUCKET, _signed_request

ORIGINS = [
    "https://candyyu.github.io",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5175",
    "http://localhost:5175",
]
RULE_METHODS = ["GET", "HEAD"]
MAX_AGE = "600"


def _strip_ns(tag: str) -> str:
    return tag.split("}", 1)[-1]


def _rules(root):
    return [el for el in root.iter() if _strip_ns(el.tag) == "CORSRule"]


def build_cors_xml(existing_xml: bytes | None) -> str:
    if existing_xml:
        root = ET.fromstring(existing_xml)
        for rule in _rules(root):
            origins = {o.text for o in rule.iter() if _strip_ns(o.tag) == "AllowedOrigin"}
            methods = {m.text for m in rule.iter() if _strip_ns(m.tag) == "AllowedMethod"}
            if set(ORIGINS).issubset(origins) and set(RULE_METHODS).issubset(methods):
                return ""  # 已存在完全覆盖我们的规则
    else:
        root = ET.Element("CORSConfiguration")

    rule = ET.SubElement(root, "CORSRule")
    for o in ORIGINS:
        ET.SubElement(rule, "AllowedOrigin").text = o
    for m in RULE_METHODS:
        ET.SubElement(rule, "AllowedMethod").text = m
    ET.SubElement(rule, "AllowedHeader").text = "*"
    for h in ("ETag", "Content-Length", "Cache-Control"):
        ET.SubElement(rule, "ExposeHeader").text = h
    ET.SubElement(rule, "MaxAgeSeconds").text = MAX_AGE
    return ET.tostring(root, encoding="unicode")


def read_cors():
    """返回 (http_status, body_bytes)。"""
    return _signed_request("GET", "?cors")


def main():
    print(f"目标 bucket：{BUCKET}")
    status, body = read_cors()
    if status == 200:
        print(f"当前已有 CORS 配置（HTTP {status}）：")
        print(body.decode("utf-8", errors="replace"))
    elif status == 404:
        print(f"bucket 还没有任何 CORS 配置（HTTP {status}），将新建。")
    else:
        sys.exit(f"❌ 读取现有 CORS 失败：HTTP {status}\n"
                 f"常见原因：AccessKey 对应的 RAM 子账号没有 oss:GetBucketCORS 权限。\n"
                 f"{body.decode('utf-8', errors='replace')}")
    existing = body if status == 200 else None

    xml = build_cors_xml(existing)
    if not xml:
        print("✅ 规则已存在且覆盖所需来源，无需修改。")
    else:
        print("→ 写入合并后的 CORS 配置（保留已有规则，仅追加）…")
        status, resp = _signed_request(
            "PUT", "?cors", data=xml.encode("utf-8"), content_type="application/xml"
        )
        if status != 200:
            sys.exit(f"❌ 写入 CORS 失败：HTTP {status}\n"
                     f"常见原因：RAM 子账号缺少 oss:PutBucketCORS 权限。\n"
                     f"{resp.decode('utf-8', errors='replace')}")

    # 回读校验：确认真的写进去了（防止 SDK/网关静默吞错）
    status2, body2 = read_cors()
    if status2 != 200:
        sys.exit(f"❌ 写入后回读失败：HTTP {status2}，请人工到 OSS 控制台确认。")
    text2 = body2.decode("utf-8", errors="replace")
    missing = [o for o in ORIGINS if o not in text2]
    if missing:
        sys.exit("❌ 回读发现以下来源未生效：" + ", ".join(missing) + "\n" + text2)

    print("✅ CORS 已确认生效。允许的来源：")
    for o in ORIGINS:
        print("  ", o)
    print("现在 pad/浏览器从 candyyu.github.io 打开就能读到作业文本了。")


if __name__ == "__main__":
    main()
