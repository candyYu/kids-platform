// 生成古诗行 mp3：用 macOS 自带 say（婷婷 voice）+ ffmpeg 转 mp3
// 不依赖网络，输出跟你之前 console log 看到的"婷婷 zh-CN"完全一致
//
// 用法：node scripts/gen-poem-audio.mjs
// 输出：apps/yuwen/public/audio/poem-lines/{poem-id}-line-{n}.mp3

import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// 直接从 poems.ts 解析 POEMS 数组（避免硬编码诗句）
// 用正则提取 id 和 lines.chars（不依赖 TS 编译，简单粗暴但够用）
const poemsSrc = readFileSync(join(ROOT, 'src/data/poems.ts'), 'utf-8')

function extractPoems() {
  // 匹配每个 { id: 'xxx', ... lines: [ { chars: '...', pinyin: '...' }, ... ] }
  const poems = []
  const poemRe = /id:\s*['"]([\w-]+)['"][\s\S]*?lines:\s*\[([\s\S]*?)\]/g
  const charsRe = /chars:\s*['"]([^'"]+)['"]/g
  let m
  while ((m = poemRe.exec(poemsSrc))) {
    const id = m[1]
    const linesBlock = m[2]
    const lines = []
    let c
    while ((c = charsRe.exec(linesBlock))) {
      lines.push(c[1])
    }
    if (lines.length > 0) poems.push({ id, lines })
  }
  return poems
}

const POEMS = extractPoems()
console.log(`解析到 ${POEMS.length} 首诗，共 ${POEMS.reduce((s, p) => s + p.lines.length, 0)} 行`)

const OUT_DIR = join(ROOT, 'public/audio/poem-lines')
mkdirSync(OUT_DIR, { recursive: true })

// macOS 中文 voice：Tingting (zh_CN 简中), Meijia (zh_TW), Sinji (zh_HK)
// 优先用 Tingting，跟你之前 console log 看到的"婷婷 zh-CN"一致
const VOICE = 'Tingting'
// 语速：古诗要慢一点（0.4 速度），更抑扬顿挫
// say --rate 接受 words per minute，默认 175，120-150 比较适合古诗
const RATE = 130

let success = 0
let skipped = 0
let failed = 0

for (const poem of POEMS) {
  for (let i = 0; i < poem.lines.length; i++) {
    const lineNum = i + 1
    const outFile = join(OUT_DIR, `${poem.id}-line-${lineNum}.mp3`)
    if (existsSync(outFile) && statSync(outFile).size > 500) {
      skipped++
      continue
    }
    const text = poem.lines[i]
    const aiff = `/tmp/poem-${poem.id}-${lineNum}.aiff`
    try {
      // 1. say 生成 aiff
      execSync(`say -v ${VOICE} --rate=${RATE} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe' })
      // 2. ffmpeg 转 mp3
      execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe' })
      // 3. 清理 aiff
      execSync(`rm -f ${aiff}`, { stdio: 'pipe' })
      const size = statSync(outFile).size
      console.log(`  ✓ ${poem.id} line ${lineNum}: "${text}" → ${size} bytes`)
      success++
    } catch (e) {
      console.error(`  ✗ ${poem.id} line ${lineNum}: ${e.message}`)
      failed++
    }
  }
}

console.log(`\n完成: ${success} 成功, ${skipped} 跳过, ${failed} 失败`)
console.log(`输出目录: ${OUT_DIR}`)
