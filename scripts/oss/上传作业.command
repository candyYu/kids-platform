#!/bin/bash
# 双击本文件即可上传当天作业（macOS 会自动打开终端）。
# Key 只在本次运行的终端里问你，不写进任何文件。

cd "$(dirname "$0")" || exit 1
clear
echo "================ 作业上传 ================"
if [ -z "$OSS_ACCESS_KEY_ID" ]; then
  read -r -p "请粘贴 AccessKey ID，回车: " OSS_ACCESS_KEY_ID
  export OSS_ACCESS_KEY_ID
fi
if [ -z "$OSS_ACCESS_KEY_SECRET" ]; then
  read -r -s -p "请粘贴 AccessKey Secret（输入不显示，正常现象），回车: " OSS_ACCESS_KEY_SECRET
  export OSS_ACCESS_KEY_SECRET
  echo
fi
echo
python3 upload-homework.py
echo
read -r -p "完成，按回车关闭窗口..."
