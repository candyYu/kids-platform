// 生成绘本朗读 mp3：macOS say（Tingting 声）+ ffmpeg 转 mp3
// 解析 src/data/storybooks.ts 的 pages 文本，逐句生成
// 输出：public/audio/storybook/{id}/p{N}.mp3（N = 页码，从 1 起）
// 结束后打印 MD5 查重报告（相同音频 = 同文本，正常；不同文本同 MD5 = 有 bug 必须查）
//
// 用法：node scripts/gen-storybook-audio.mjs [--force]

import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const FORCE = process.argv.includes('--force')

// 从 storybooks.ts 提取 { id, pages[] }（正则解析，避免 TS 编译依赖）
const src = readFileSync(join(ROOT, 'src/data/storybooks.ts'), 'utf-8')

function extractStorybooks() {
  const books = []
  // 每本：id: 'xxx', ... pages: [ { text: '...' }, ... ]
  const bookRe = /id:\s*['"]([\w-]+)['"][\s\S]*?pages:\s*\[([\s\S]*?)\]/g
  const textRe = /text:\s*'([^']+)'/g
  let m
  while ((m = bookRe.exec(src))) {
    const id = m[1]
    const block = m[2]
    const pages = []
    let t
    while ((t = textRe.exec(block))) pages.push(t[1])
    if (pages.length > 0) books.push({ id, pages })
  }
  return books
}

const BOOKS = extractStorybooks()
console.log(`解析到 ${BOOKS.length} 本绘本，共 ${BOOKS.reduce((s, b) => s + b.pages.length, 0)} 句`)

const VOICE = 'Tingting'
// 绘本句子比古诗长，语速稍快一点，130→150 自然
const RATE = 150

let success = 0, skipped = 0, failed = 0
const made = []

for (const book of BOOKS) {
  const outDir = join(ROOT, `public/audio/storybook/${book.id}`)
  mkdirSync(outDir, { recursive: true })
  for (let i = 0; i < book.pages.length; i++) {
    const n = i + 1
    const outFile = join(outDir, `p${n}.mp3`)
    if (!FORCE && existsSync(outFile) && statSync(outFile).size > 500) {
      skipped++
      continue
    }
    const text = book.pages[i]
    const aiff = `/tmp/story-${book.id}-${n}.aiff`
    try {
      execSync(`say -v ${VOICE} --rate=${RATE} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe' })
      execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe' })
      execSync(`rm -f ${aiff}`, { stdio: 'pipe' })
      const size = statSync(outFile).size
      console.log(`  ✓ ${book.id} p${n}: "${text}" → ${size} bytes`)
      made.push({ file: outFile, text })
      success++
    } catch (e) {
      console.error(`  ✗ ${book.id} p${n}: ${e.message}`)
      failed++
    }
  }
}

// MD5 查重（教师零容忍读错：相同 MD5 的文件必须对应相同文本）
console.log(`\n生成 ${success}，跳过 ${skipped}，失败 ${failed}`)
if (made.length > 0) {
  const md5s = {}
  for (const { file, text } of made) {
    const md5 = execSync(`md5 -q ${JSON.stringify(file)}`).toString().trim()
    if (md5s[md5] && md5s[md5].text !== text) {
      console.error(`  !! MD5 冲突: "${md5s[md5].text}" vs "${text}"（不同文本同音频 = 必查 bug）`)
    }
    md5s[md5] = { file, text }
  }
  const texts = new Map()
  for (const { text } of made) texts.set(text, (texts.get(text) || 0) + 1)
  const dups = [...texts.entries()].filter(([, c]) => c > 1)
  if (dups.length) console.log(`  同文本重复（正常）: ${dups.map(([t, c]) => `"${t}"×${c}`).join(', ')}`)
  console.log(`MD5 查重完成：${Object.keys(md5s).length} 个唯一音频 / ${made.length} 个文件`)
}
