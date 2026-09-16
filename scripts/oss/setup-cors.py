#!/usr/bin/env python3
"""
一次性脚本：给 OSS bucket 配置 CORS，让 pad/浏览器能 fetch 作业文本。
（音频/视频用 <audio>/<video> 标签不受 CORS 限制；作业是 fetch，必须配。）

安全策略：先读现有 CORS 规则，只在缺我们的规则时追加一条，绝不覆盖已有配置。

用法：
  export OSS_ACCESS_KEY_ID=...
  export OSS_ACCESS_KEY_SECRET=...
  ./setup-cors.py
"""
import sys
import xml.etree.ElementTree as ET

from oss_common import _signed_request

ORIGINS = [
    "https://candyYu.github.io",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5175",
    "http://localhost:5175",
]
RULE_METHODS = ["GET", "HEAD"]
MAX_AGE = "600"


def build_cors_xml(existing_xml: bytes | None) -> str:
    if existing_xml:
        root = ET.fromstring(existing_xml)
        for rule in root.findall("CORSRule"):
            origins = {o.text for o in rule.findall("AllowedOrigin")}
            methods = {m.text for m in rule.findall("AllowedMethod")}
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


def main():
    status, body = _signed_request("GET", "?cors")
    existing = body if status == 200 else None
    if status not in (200, 404):
        sys.exit(f"读取现有 CORS 失败：HTTP {status}\n{body.decode('utf-8', errors='replace')}")

    xml = build_cors_xml(existing)
    if not xml:
        print("✅ CORS 规则已存在，无需修改。")
        return

    status, resp = _signed_request(
        "PUT", "?cors", data=xml.encode("utf-8"), content_type="application/xml"
    )
    if status != 200:
        sys.exit(f"配置 CORS 失败：HTTP {status}\n{resp.decode('utf-8', errors='replace')}")
    print("✅ CORS 已配置（追加规则，未动已有配置）。允许的来源：")
    for o in ORIGINS:
        print("  ", o)


if __name__ == "__main__":
    main()
