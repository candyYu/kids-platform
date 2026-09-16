# 作业板块 + 拼音摘星卡数字化 设计文档

日期：2026-09-16
状态：已获用户口头批准（"好的，你把oss上传脚本给我写好"），脚本先行交付。

## 背景与动机

孩子上一年级，家长（语文教师）布置四门作业：语文、数学、英语、小提琴练习。
家长在电脑上录作业，孩子用 Android pad（Chrome PWA / WebView）完成，
两台设备 localStorage 物理隔离——本地方案不成立。桌面另有教师自编的
《2026 拼音摘星卡》（14 课，docx/pdf + 每课一段家长示范录音，共 92MB），
需要数字化、可点读，并能从当天作业一键打开。

## 范围

做：
1. OSS 驱动的"当天作业"：家长编辑约定格式文本 → 脚本上传 → pad 首页顶部展示、打勾。
2. 语文 app 新增摘星卡板块（14 课）：拼音/词语点读 + 整课录音 + 自评☆。
3. 作业行与摘星卡按"摘星卡第N课"自动关联直达。

不做：
- 后端服务、账号、多设备打勾同步、作业历史、推送提醒。
- app 内作业增删界面（完全文件驱动）。
- 小提琴录音/调音（纯文字作业）。
- 改动任何现有学科 app 的既有功能。

## 一、作业板块

### 数据流

```
桌面 作业-homework.txt（家长编辑）
   │  python3 scripts/oss/upload-homework.py（OSS V1 签名 PUT）
   ▼
OSS homework/homework.txt  (Content-Type: text/plain; charset=utf-8, Cache-Control: no-cache)
   │  pad fetch（cache-bust: ?t=分钟级时间戳）
   ▼
web 首页顶部"今日作业"区
```

无后端。匿名公共读 bucket 承载小文本（几百字节/天，流量费可忽略）。

### 文件格式约定

- UTF-8 文本；`#` 注释行、空行忽略；每行 `学科 内容`。
- 学科枚举：语文 / 数学 / 英语 / 小提琴（前缀匹配）。
- 语文行匹配正则 /摘星卡第?(\d+)课/ → 附 🎴 深链接。
- 上传脚本本地预校验，非法行拒绝上传并报行号。

### 家长侧

- 桌面文件 `~/Desktop/作业-homework.txt`（首次运行由模板创建）。
- 每天覆盖保存；双击 Finder 里的 `上传作业.command`（或终端跑脚本）。
- 密钥只走环境变量 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET，不落盘。
- 上传成功定义：PUT 200 + 匿名 GET 回读 MD5 一致。

### 孩子侧（web app, 端口 5173，路由 hash #/homework 或首页内嵌）

- 首页最顶部（星星条之上）今日作业卡：学科 emoji + 内容 + 圆圈打勾；
  语文摘星卡行多一个 🎴 按钮，链接 `/yuwen/star-cards/L05`（生产）
  / `http://127.0.0.1:5175/star-cards/L05`（dev，沿用现有 isDev 模式）。
- 打勾状态：localStorage `kids_homework_checks_v1`，键 = 内容文本 hash；
  作业内容变了旧勾自然失效。打勾仅本机，不回传（物理隔离已知并接受）。
- fetch 失败/404/空文件 → 显示"今天没有作业 🎉"（404）或
  "作业暂时打不开，问问妈妈"（网络错），绝不白屏。
- 平台密码孩子已知，密码只用于进门，不承担家长隔离职责，因此不设家长门。

### OSS 配置

- CORS 追加规则（setup-cors.py，先读后追加，不覆盖现有）：
  GET/HEAD，AllowedOrigin：candyYu.github.io + 5173/5175 的 127.0.0.1 与 localhost。
- 防盗链沿用现状（github.io 白名单 + 允许空 Referer）。

## 二、拼音摘星卡（yuwen app 内）

### 内容（来自 2026摘星卡.docx，需教师眼审后才能上线）

14 课，与 app 现有拼音课一一对应：

| 摘星卡课次 | 标题 | 满☆ | 对应 lessonId |
|---|---|---|---|
| 1 | ɑ o e | 46 | L01 |
| 2 | i u ü | 36 | L02 |
| 3 | b p m f | 59 | L03 |
| 4 | d t n l | 95 | L04 |
| 5 | ɡ k h | 95 | L05 |
| 6 | j q x | 46 | L06 |
| 7 | z c s | 67 | L07 |
| 8 | zh ch sh r | 53 | L08 |
| 9 | y w | 52 | L08Y |
| 10 | ai ei ui | 64 | L09 |
| 11 | ao ou iu | 60 | L10 |
| 12 | ie üe er | 64 | L11 |
| 13 | an en in un ün | 83 | L12 |
| 14 | ang eng ing ong | 98 | L13 |

结构：每课若干 section（准确认读 / 拼一拼读一读 / 读准词语 / 认读生字 /
背儿歌提示），section 内 item 分三类：单音节（可点读）、词语（空格分节，
整词连读）、纯提示文本（儿歌/秘诀，不发音）。docx 提取存在版式噪声
（页码数字串、串列），数据文件必须经教师逐课眼审。

### 音频

- 点读：复用 `tts.ts` 现有链路 `speakPinyin(pinyin)`（zh-synth 2248 切片
  mp3 优先 → speechSynthesis 兜底；遵守"禁裸 speechSynthesis、catch 排除
  AbortError"铁律）。词语 = 音节顺序 await 链播，带 generation 计数防连点串读。
- 整课家长录音：OSS `star-cards/audio/star-card-lNN.m4a`，
  AAC 单声道 64kbps +faststart（92MB → 20MB，14 段时长逐一核对无损），
  卡片顶部原生 `<audio controls preload="none">`，不自动播放。
  环境变量 VITE_OSS_YUWEN_DOMAIN（与英语同 bucket 可共用域名值）。
- PDF 原件：OSS `star-cards/2026拼音摘星卡.pdf`，家长查看/打印入口。

### 页面

- 新路由 `/star-cards`（列表）与 `/star-cards/:lessonId`（单卡），
  App.tsx 加两条 Route；首页加入口（位置在实施时选最小侵入处）。
- 单卡：标题 + 满☆ + ▶️整课录音 + 各 section 大字号带调拼音；
  点按发音、长按标红（复刻"红笔圈一圈"，红色态存 localStorage）；
  底部"我摘到（ ）☆"点星自评（0..满☆），存 localStorage
  `kids_star_cards_v1`，只记录不自动发平台星星。
- 视觉：pig/sun 既有色板、rounded-bubble、大触控目标。

### 内容正确性关卡

1. 结构化数据生成 → 打印对照清单 → 教师逐课确认（拼音、声调、词语、☆数）。
2. 转码录音人工抽听（第 5/7 课必听，原 wav）→ 上传 → 线上 Range 验活。
3. 点读不新增发音资产，只用已验证切片；缺切片的音节记清单上报，不猜读。

## 三、已交付脚本（scripts/oss/）

| 文件 | 作用 | 验证状态 |
|---|---|---|
| oss_common.py | 标准库 OSS V1 签名/上传/验活 | 缺 Key 报错路径已测 |
| setup-cors.py | CORS 读-合并-写（不覆盖现有规则） | 待真实 Key 运行 |
| upload-homework.py | 作业校验+上传+MD5 回读 | 建模板/校验/缺 Key 已测 |
| upload-star-cards.py | 转码(ffmpeg)/14 m4a+PDF 上传/验活 | 转码 14 段完成，时长全对齐 |
| 上传作业.command | 双击上传，运行时问 Key | 待用户试用 |
| homework-template.txt/README.md | 模板与说明 | — |

OSS 路径与缓存头：homework no-cache；audio immutable 1 年；pdf 1 天。

## 四、实施顺序

1. （脚本已完成）用户提供 Key 环境变量后：setup-cors → 传一版作业 →
   pad/浏览器匿名 URL 验证读到。
2. 摘星卡结构化数据 + 教师眼审。
3. 录音抽听通过 → upload-star-cards upload → curl Range 验活。
4. web 作业区 + yuwen 摘星卡页开发（TDD），本地 dev（5173/5175）用户亲验。
5. tsc + build + commit + push + CI + 线上验证（BuildBadge、sw.js 版本、
   线上 fetch 作业、线上 m4a 206）。

## 风险

- RAM Key 权限不足（只读/写权限分离）→ 上传脚本报 403，需调 RAM 策略。
- 空 Referer 防盗链若日后关闭，WebView 拉作业/音频可能失败——保持开启。
- 作业文件误删/写错 → pad 显示旧缓存最多 1 分钟（cache-bust 粒度），
  no-cache 头保证下次刷新即修正；家长本地文件是唯一事实源。
