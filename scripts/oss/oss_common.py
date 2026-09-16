"""
OSS 公共工具：纯 Python 标准库实现阿里云 OSS V1 签名 + PUT/GET/HEAD。
不依赖 ossutil / requests / SDK，macOS 自带 python3 即可运行。

密钥只从环境变量读取，不写入任何配置文件：
    OSS_ACCESS_KEY_ID
    OSS_ACCESS_KEY_SECRET
可选：
    OSS_ENDPOINT  (默认 https://oss-cn-hangzhou.aliyuncs.com)
    OSS_BUCKET    (默认 kids-platform)
"""
import base64
import hashlib
import hmac
import os
import sys
from email.utils import formatdate
from urllib import request as urlrequest
from urllib.error import HTTPError

BUCKET = os.environ.get("OSS_BUCKET", "kids-platform")
ENDPOINT = os.environ.get("OSS_ENDPOINT", "https://oss-cn-hangzhou.aliyuncs.com").rstrip("/")
HOST = f"{BUCKET}.{ENDPOINT.replace('https://', '').replace('http://', '')}"
PUBLIC_BASE = f"https://{HOST}"


def need_credentials():
    ak = os.environ.get("OSS_ACCESS_KEY_ID")
    sk = os.environ.get("OSS_ACCESS_KEY_SECRET")
    if not ak or not sk:
        sys.exit(
            "缺少密钥。运行前先设置环境变量：\n"
            "  export OSS_ACCESS_KEY_ID=你的Key\n"
            "  export OSS_ACCESS_KEY_SECRET=你的Secret\n"
            "（只在当前终端窗口有效，关掉窗口就没了）"
        )
    return ak, sk


def _signed_request(method, key_with_subresource, data=None, content_type="", extra_headers=None):
    """发起带 V1 签名的请求。key_with_subresource 形如 'a/b.txt' 或 '?cors'。"""
    ak, sk = need_credentials()
    extra_headers = extra_headers or {}

    if key_with_subresource.startswith("?"):
        path = f"/{BUCKET}/{key_with_subresource}"
        url = f"{ENDPOINT}/{BUCKET}/{key_with_subresource}"
        host = HOST
    else:
        path = f"/{BUCKET}/{key_with_subresource.lstrip('/')}"
        url = f"{PUBLIC_BASE}/{key_with_subresource.lstrip('/')}"
        host = HOST

    date = formatdate(usegmt=True)
    headers = {"Date": date, "Host": host}
    headers.update(extra_headers)

    # CanonicalizedOSSHeaders：x-oss- 开头，小写、排序、去空格，每行结尾 \n
    oss_headers = ""
    for k in sorted(headers):
        lk = k.lower()
        if lk.startswith("x-oss-"):
            oss_headers += f"{lk}:{str(headers[k]).strip()}\n"

    string_to_sign = f"{method}\n\n{content_type}\n{date}\n{oss_headers}{path}"
    signature = base64.b64encode(
        hmac.new(sk.encode("utf-8"), string_to_sign.encode("utf-8"), hashlib.sha1).digest()
    ).decode("utf-8")
    headers["Authorization"] = f"OSS {ak}:{signature}"
    if content_type:
        headers["Content-Type"] = content_type

    req = urlrequest.Request(url, data=data, headers=headers, method=method)
    try:
        with urlrequest.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body.encode("utf-8")


def put_object(key, data, content_type: str, cache_control: str | None = None):
    """上传（覆盖）对象。data 接受 bytes。"""
    if isinstance(data, str):
        data = data.encode("utf-8")
    extra = {}
    if cache_control:
        extra["Cache-Control"] = cache_control
    status, body = _signed_request("PUT", key, data=data, content_type=content_type, extra_headers=extra)
    if status != 200:
        raise RuntimeError(f"上传失败 {key} → HTTP {status}\n{body.decode('utf-8', errors='replace')}")
    return f"{PUBLIC_BASE}/{key}"


def get_raw(url: str, referer: str | None = None, byte_range: str | None = None):
    """匿名 GET（用于上传后验证）。byte_range='bytes=0-0' 只取 1 字节（音频验活省流量）。"""
    headers = {}
    if referer:
        headers["Referer"] = referer
    if byte_range:
        headers["Range"] = byte_range
    req = urlrequest.Request(url, headers=headers)
    try:
        with urlrequest.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read(), dict(resp.headers)
    except HTTPError as e:
        return e.code, e.read(), dict(e.headers)


def signed_get(subresource: str):
    """带签名的 GET（读 bucket 配置用，如 ?cors）。"""
    return _signed_request("GET", subresource)
