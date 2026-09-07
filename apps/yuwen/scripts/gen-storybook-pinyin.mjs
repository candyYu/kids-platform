// 生成绘本逐字注音数据：pinyin-pro 初稿 + OVERRIDE 多音字/轻声修正
// 输出：src/data/storybook-rubies.ts
// 数据结构：Record<storyId, Array<Array<{ hz: string; py: string }>>>（书 → 页 → 逐字）
// 标点/空格 py 为空，UI 渲染时跳过注音只显示原字符
//
// 校对规范（部编教材）：
// - 轻声词注轻声不标调（锄头→tou、铃铛→dang、麻烦→fan、答应→ying）
// - 变调标原调（"看不清"的 bù、"不动了"的 bù）
// - ABB 叠词标原调（暖烘烘 hōng hōng）
//
// 用法：node scripts/gen-storybook-pinyin.mjs [--check]（--check 只打印不写文件）

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { pinyin } from 'pinyin-pro'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CHECK = process.argv.includes('--check')

const src = readFileSync(join(ROOT, 'src/data/storybooks.ts'), 'utf-8')

// 与音频脚本相同的解析逻辑（pages 块锚定 quiz 结尾）
function extractStorybooks() {
  const books = []
  const bookRe = /id:\s*['"]([\w-]+)['"][\s\S]*?pages:\s*\[([\s\S]*?)\]\s*,\s*quiz/g
  const textRe = /text:\s*'([^']+)'/g
  let m
  while ((m = bookRe.exec(src))) {
    const pages = []
    let t
    while ((t = textRe.exec(m[2]))) pages.push(t[1])
    if (pages.length > 0) books.push({ id: m[1], pages })
  }
  return books
}

// 多音字/轻声人工修正表：键 = 词（按原文字符匹配），值 = 每字修正拼音（null = 不改该字）
// 只列教材规范与库默认不一致的，其余信任 pinyin-pro 分词读音
const OVERRIDE = {
  // 轻声词（部编教材注轻声不标调）
  '锄头': [null, 'tou'],
  '铃铛': [null, 'dang'],
  '麻烦': [null, 'fan'],
  '答应': [null, 'ying'],
  '的地方': [null, null, 'fang', null],   // 名词"处所"义，现汉/部编注轻声
  '耳朵': [null, 'duo'],
  // 助词"得"→de（补语结构，库默认 dé）
  '跑得太快': [null, 'de', null, null],
  '长得太慢': ['zhǎng', 'de', null, null],
  '跑得快': [null, 'de', null],
  '跑得慢': [null, 'de', null],
  '大得很': [null, 'de', null],
  '裹得更紧': [null, 'de', null, null],
  '吓得': [null, 'de', null],
  '传得很远': [null, 'de', null, null],
  '谈得投机': [null, 'de', null, null],
  '觉得': ['jué', 'de'],
  // 助词"地"→de（状语结构，库默认 dì）
  '安静地等': [null, null, 'de', null, null],
  '不停地爬': [null, null, 'de', null, null],
  '呼呼地吹': [null, null, 'de', null, null],
  '烘烘地照': [null, null, 'de', null, null],
  '飞快地逃': [null, null, 'de', null, null],
  // 多音字语境修正（库分词误判）
  '长满了': ['zhǎng', null, null],        // 生长义，非 cháng
  '长高了': ['zhǎng', null, null],
  '干了一整天': ['gàn', null, null, null, null], // 做事义，非 gān
  '结拜为兄弟': [null, null, 'wéi', null, null], // "成为"义读 wéi
}

const isHan = (c) => /[\u4e00-\u9fff]/.test(c)

function pageRubies(text) {
  // type:'all' 逐字符对齐；结果字段是 result（不是 originPinyin）
  // toneSandhi:false → "一/不"标原调（部编教材规范：注音标原调不标变调）
  // nonZh:'spaced' → 非汉字逐字符独立项，chars 与原文一一对应（consecutive 会合并标点导致 OVERRIDE 错位）
  const all = pinyin(text, { type: 'all', toneType: 'symbol', nonZh: 'spaced', toneSandhi: false })
  const chars = all.map((x) => ({
    hz: x.origin,
    py: x.isZh ? (x.result || '') : '',
  }))
  // 应用 OVERRIDE：在原文字符序列上找词，覆盖对应字的拼音
  const raw = text
  for (const [word, pys] of Object.entries(OVERRIDE)) {
    let from = 0
    while (true) {
      const i = raw.indexOf(word, from)
      if (i < 0) break
      // 词起点在 chars 数组中的下标 = 前 i 个字符的位置（chars 与 raw 逐字符一一对应）
      for (let k = 0; k < word.length; k++) {
        if (pys[k]) chars[i + k].py = pys[k]
      }
      from = i + 1
    }
  }
  return chars
}

const BOOKS = extractStorybooks()
if (BOOKS.length === 0) {
  console.error('未解析到任何绘本，解析逻辑或数据格式有误')
  process.exit(1)
}

const result = {}
for (const b of BOOKS) result[b.id] = b.pages.map(pageRubies)

if (CHECK) {
  // 校对模式：打印每个字，重点看多音字
  for (const b of BOOKS) {
    console.log(`\n== ${b.id} ==`)
    b.pages.forEach((p, i) => {
      const line = result[b.id][i].map((c) => (c.py ? `${c.hz}:${c.py}` : c.hz)).join(' ')
      console.log(`p${i + 1}  ${line}`)
    })
  }
  process.exit(0)
}

// 写 TS 数据文件（紧凑格式：每页一行）
const fmtBook = (pages) =>
  '[\n' + pages.map((p) => '    [' + p.map((c) => JSON.stringify(c)).join(',') + ']').join(',\n') + '\n  ]'
const ts = `// 自动生成：scripts/gen-storybook-pinyin.mjs（绘本逐字注音，部编教材规范）
// 重新生成：node scripts/gen-storybook-pinyin.mjs
// 多音字/轻声修正表在脚本的 OVERRIDE 中

export type Ruby = { hz: string; py: string }

export const STORYBOOK_RUBIES: Record<string, Ruby[][]> = {
${Object.entries(result).map(([k, v]) => `  "${k}": ${fmtBook(v)}`).join(',\n')}
}
`
writeFileSync(join(ROOT, 'src/data/storybook-rubies.ts'), ts)
const total = Object.values(result).reduce((s, b) => s + b.reduce((s2, p) => s2 + p.length, 0), 0)
console.log(`✓ ${Object.keys(result).length} 本 / ${Object.values(result).reduce((s, b) => s + b.length, 0)} 页 / ${total} 字 → src/data/storybook-rubies.ts`)
