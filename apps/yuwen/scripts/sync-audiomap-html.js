#!/usr/bin/env node
/**
 * sync-audiomap-html.js
 *
 * 同步 audioMap.ts → public/verify-slices.html + public/match-slices.html
 * 让核对页面的硬编码 CURRENT_MAP 永远跟 .ts 源文件一致。
 *
 * 用法：
 *   node scripts/sync-audiomap-html.js
 *
 * 或者加到 package.json：
 *   "sync:audio": "node scripts/sync-audiomap-html.js"
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const AUDIO_MAP = resolve(ROOT, 'src/audio/audioMap.ts')
const VERIFY_HTML = resolve(ROOT, 'public/verify-slices.html')
const MATCH_HTML = resolve(ROOT, 'public/match-slices.html')

// ===== 1. 解析 src/audio/audioMap.ts =====
const src = readFileSync(AUDIO_MAP, 'utf-8')

// 1a) 提取出每行末尾的 `// ⚠️ 修正：原 slice_xx` 修正信息（按 lessonId → pinyin → origSlice）
//     因为下面会去掉注释
const fixInfo = new Map() // lessonId -> Map<pinyin, origSlice>
{
  const lessonRe = /export const (L\d+)_AUDIO[\s\S]*?\[([\s\S]*?)\n\]/g
  let lm
  while ((lm = lessonRe.exec(src))) {
    const lessonId = lm[1]
    const body = lm[2]
    const lessonFixes = new Map()
    // 匹配每个条目末尾的修正注释
    const entryRe = /\{\s*pinyin:\s*'([^']+)'[\s\S]*?\}\s*\/\/\s*⚠️\s*修正：原\s*slice_(\d+)/g
    let em
    while ((em = entryRe.exec(body))) {
      lessonFixes.set(em[1], em[2])
    }
    if (lessonFixes.size) fixInfo.set(lessonId, lessonFixes)
  }
}

// 1b) 解析 note 字段（'声母 d'、'复韵母 ao' 等）
const noteInfo = new Map() // lessonId -> Map<pinyin, note>
{
  const lessonRe = /export const (L\d+)_AUDIO[\s\S]*?\[([\s\S]*?)\n\]/g
  let lm
  while ((lm = lessonRe.exec(src))) {
    const lessonId = lm[1]
    const body = lm[2]
    const lessonNotes = new Map()
    const entryRe = /\{\s*pinyin:\s*'([^']+)'\s*,\s*file:\s*'[^']+'\s*,\s*note:\s*'([^']+)'/g
    let em
    while ((em = entryRe.exec(body))) {
      lessonNotes.set(em[1], em[2])
    }
    if (lessonNotes.size) noteInfo.set(lessonId, lessonNotes)
  }
}

// 1c) 去掉类型注解和注释
let stripped = src.replace(/^\s*\/\/.*$/gm, '')
stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '')
stripped = stripped.replace(/:\s*AudioSlice\[\]/g, '')
stripped = stripped.replace(/:\s*AudioSlice\b/g, '')
stripped = stripped.replace(/\s+as\s+\d+\s*\|\s*\d+/g, '')
stripped = stripped.replace(/export interface AudioSlice\s*\{[\s\S]*?\n\}/g, '')

const map = new Map()
const arrayRe = /const\s+(L\d+)_AUDIO\s*=\s*\[([\s\S]*?)\]/g
let m
while ((m = arrayRe.exec(stripped))) {
  const lessonId = m[1]
  const body = m[2]
  const items = []
  // 匹配 { pinyin: 'x', file: 'y', note: '...' }
  const entryRe = /\{\s*pinyin:\s*'([^']+)'\s*,\s*file:\s*'([^']+)'/g
  let em
  while ((em = entryRe.exec(body))) {
    items.push({ pinyin: em[1], file: em[2] })
  }
  if (items.length) map.set(lessonId, items)
}

if (map.size === 0) {
  console.error('❌ 没能从 audioMap.ts 解析出任何 Lxx_AUDIO 数组')
  console.error('--- 试着输出剥离后的片段 ---')
  console.error(stripped.slice(0, 2000))
  process.exit(1)
}

console.log(`✅ 从 audioMap.ts 解析出 ${map.size} 课：${[...map.keys()].join(', ')}`)

// ===== 2. 生成 HTML 替换块 =====

function buildVerifyArray(map) {
  // verify-slices.html 用数组结构
  const lines = []
  for (const [lessonId, items] of map) {
    lines.push(`  ${lessonId}: [`)
    for (const it of items) {
      const short = it.file.replace(/^\/audio\/slices\//, '')
      lines.push(`    { pinyin: '${it.pinyin}', file: '${short}', note: '' },`)
    }
    lines.push(`  ],`)
  }
  return lines.join('\n')
}

function buildMatchObject(map) {
  // match-slices.html 用对象结构
  const lines = []
  for (const [lessonId, items] of map) {
    const kv = items.map(it => `'${it.pinyin}':'${it.file}'`).join(',')
    lines.push(`  ${lessonId}: { ${kv} },`)
  }
  return lines.join('\n')
}

// ===== 3. 替换两个 HTML =====

// 3a. verify-slices.html
const verifySrc = readFileSync(VERIFY_HTML, 'utf-8')
const newVerifyMap = `const MAP = {\n${buildVerifyArray(map)}\n}`
const verifyRe = /const MAP = \{[\s\S]*?\n\}/
if (!verifyRe.test(verifySrc)) {
  console.error(`❌ ${VERIFY_HTML} 找不到 const MAP = { ... }`)
  process.exit(1)
}
writeFileSync(VERIFY_HTML, verifySrc.replace(verifyRe, newVerifyMap))
console.log(`✅ ${VERIFY_HTML} 已同步`)

// 3b. match-slices.html
const matchSrc = readFileSync(MATCH_HTML, 'utf-8')
const newMatchMap = `const CURRENT_MAP = {\n${buildMatchObject(map)}\n}`
const matchRe = /const CURRENT_MAP = \{[\s\S]*?\n\}/
if (!matchRe.test(matchSrc)) {
  console.error(`❌ ${MATCH_HTML} 找不到 const CURRENT_MAP = { ... }`)
  process.exit(1)
}
writeFileSync(MATCH_HTML, matchSrc.replace(matchRe, newMatchMap))
console.log(`✅ ${MATCH_HTML} 已同步`)

console.log('')
console.log('🎉 同步完成！')
