// 测试 edge-tts 能不能跑通
// 直接 require 编译好的 dist 路径（不需要 tsx）
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { tts, getVoices } = require('edge-tts/out/index.js')

console.log('测试 edge-tts 连通性...')
const start = Date.now()
try {
  const buf = await tts('鹅鹅鹅，曲项向天歌。', { voice: 'zh-CN-XiaoxiaoNeural' })
  console.log(`✓ 成功！耗时 ${Date.now() - start}ms，mp3 大小 ${buf.length} bytes`)
  console.log('中文 voice 列表：')
  const voices = await getVoices()
  const zh = voices.filter(v => v.Locale.startsWith('zh'))
  console.log(zh.map(v => `  ${v.ShortName} (${v.Gender})`).join('\n'))
} catch (e) {
  console.error('✗ 失败:', e.message)
  process.exit(1)
}
