# OSS 上传脚本（作业 + 拼音摘星卡）

纯 Python 标准库实现，macOS 自带 python3 即可运行，不需要安装 ossutil 或任何依赖。
密钥只从环境变量 / 运行时输入读取，不写入任何配置文件。

## 文件说明

| 文件 | 用途 |
|------|------|
| oss_common.py | 公共：OSS V1 签名、PUT 上传、匿名验活（不要单独运行） |
| setup-cors.py | 一次性：配置 bucket CORS（pad 用 fetch 读作业必须先配） |
| upload-homework.py | 每天用：上传桌面「作业-homework.txt」覆盖 OSS 上的作业 |
| upload-star-cards.py | 一次性：14 课录音转码 + 上传 + PDF 上传 |
| homework-template.txt | 作业文件模板（首次运行会复制到桌面） |
| 上传作业.command | 双击版作业上传（自动开终端、问 Key、跑脚本） |

## 首次设置（只做一次）

需要阿里云 RAM 子账号的 AccessKey ID / Secret（要求有目标 bucket 的读写权限，
之前传英语视频用的那个子账号即可；找不到就在 RAM 控制台重建一对）。

1. 配 CORS（让 pad 能读到作业文本）：

   ```bash
   cd /Users/candy/Work/kids-platform/scripts/oss
   export OSS_ACCESS_KEY_ID=你的Key
   export OSS_ACCESS_KEY_SECRET=你的Secret
   python3 setup-cors.py
   ```

2. 摘星卡录音转码（不需要 Key），转完务必抽听第 5、7 课（原来是大 wav）确认没转坏：

   ```bash
   python3 upload-star-cards.py transcode
   # 转码结果在 /tmp/star-cards-audio/，文件名 star-card-l01.m4a ... l14.m4a
   ```

3. 抽听没问题后上传录音 + PDF：

   ```bash
   python3 upload-star-cards.py upload
   ```

## 每天发布作业（两种方式任选）

方式 A（推荐）：Finder 里双击 `上传作业.command`，按提示粘 Key。

方式 B（终端）：

```bash
cd /Users/candy/Work/kids-platform/scripts/oss
export OSS_ACCESS_KEY_ID=...
export OSS_ACCESS_KEY_SECRET=...
python3 upload-homework.py
```

首次运行会在桌面创建 `作业-homework.txt` 模板，改完保存再跑一次。

## 作业文件格式

- UTF-8 纯文本（macOS 文本编辑默认即 UTF-8；脚本会自动去掉 Windows BOM）
- 按学科分块：学科（语文 / 数学 / 英语 / 小提琴）单独成行，下面每行一条要求，
  直到下一个学科行；学科也可以在同一行直接写内容
- 某科今天没作业：写了学科空着会被跳过（提示但不拦上传）；不写这科也行
- 全空文件也允许上传，pad 首页显示"今天没有作业 🎉"
- `#` 开头是注释，空行忽略
- 内容里出现「摘星卡第N课」会自动挂直达卡片按钮
  （注意：「摘星本 P1」指纸质本页码，不会误判）

```
语文
1.复习第一单元生字，书空听写。
2.读摘星卡第1课三遍，读错的圈出来。
3.预习《iuv》

数学
1.口算练习第12页

英语 读pad上英语5分钟
小提琴 持弓练习20分钟
```

脚本上传前会解析整个文件，格式错误（如学科行之外有游离内容）会拒绝上传并指出行号。

## OSS 上的路径

| 路径 | 说明 | Cache-Control |
|------|------|---------------|
| homework/homework.txt | 当天作业（每天覆盖） | no-cache |
| star-cards/audio/star-card-lNN.m4a | 14 课整课录音 | 1 年 immutable |
| star-cards/2026拼音摘星卡.pdf | 纸质版 PDF（家长打印） | 1 天 |

公开基址：https://kids-platform.oss-cn-hangzhou.aliyuncs.com/

## 安全

- Key 只存在当前终端环境变量里，关窗口即消失
- `.command` 文件不保存 Key；仓库里的任何文件都不含密钥
- 脚本只对固定 bucket 的固定路径做 PUT，先读回校验成功才报告完成
