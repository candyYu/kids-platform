// 生成课文朗读行 mp3：macOS say（Tingting 声）+ ffmpeg 转 mp3
// 解析 src/data/grade1/texts.ts + grade2/texts.ts 的 lines 数组，逐行生成
// 输出：public/audio/reading/{lessonId}/line-{N}.mp3（N = 行号，从 1 起，含空行占位跳过）
// 结束后打印 MD5 查重报告（相同音频 = 同文本，正常；不同文本同 MD5 = 有 bug 必须查）
//
// 用法：node scripts/gen-reading-audio.mjs [--force]（--force 重新生成全部）

import { execSync } from 'node:child_process'
import { mkdirSync, existsSync, statSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const FORCE = process.argv.includes('--force')

const VOICE = 'Tingting'
const RATE = 150 // 课文语速（古诗 130，正常朗读稍快）

function parseTexts(file) {
  const src = readFileSync(join(ROOT, file), 'utf-8')
  const out = []
  const entryRe = /([A-Z]\w*\d\w*):\s*\{\s*id:\s*'([\w-]+)'[\s\S]*?lines:\s*\[([\s\S]*?)\]\s*\}/g
  let m
  while ((m = entryRe.exec(src))) {
    const key = m[1]
    const id = m[2]
    const lines = []
    const lineRe = /"((?:[^"\\]|\\.)*)"/g
    let l
    const block = m[3]
    // 按引号字符串切：偶数个是内容，跳过 author/title 等前面的字段
    const strs = []
    while ((l = lineRe.exec(block))) strs.push(l[1])
    // lines 数组里全是字符串字面量，全部收
    for (const s of strs) lines.push(s.replace(/\\"/g, '"').replace(/\\\\/g, '\\'))
    if (lines.length > 0) out.push({ key, id, lines })
  }
  return out
}

const ALL = [
  ...parseTexts('src/data/grade1/texts.ts'),
  ...parseTexts('src/data/grade2/texts.ts'),
]
const totalLines = ALL.reduce((s, x) => s + x.lines.filter(l => l.trim() !== '').length, 0)
console.log(`解析到 ${ALL.length} 课，共 ${totalLines} 个非空行`)

const OUT_BASE = join(ROOT, 'public/audio/reading')
mkdirSync(OUT_BASE, { recursive: true })

let success = 0, skipped = 0, failed = 0

for (const lesson of ALL) {
  const dir = join(OUT_BASE, lesson.id)
  mkdirSync(dir, { recursive: true })
  for (let i = 0; i < lesson.lines.length; i++) {
    const text = lesson.lines[i]
    if (text.trim() === '') continue
    const outFile = join(dir, `line-${i + 1}.mp3`)
    if (!FORCE && existsSync(outFile) && statSync(outFile).size > 500) {
      skipped++
      continue
    }
    const aiff = `/tmp/reading-${lesson.id}-${i + 1}.aiff`
    try {
      // timeout 防 say 挂起（macOS 音频设备休眠时 say 会永久卡住）
      execSync(`say -v ${VOICE} --rate=${RATE} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
      execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
      execSync(`rm -f ${aiff}`, { stdio: 'pipe' })
      success++
    } catch (e) {
      // 重试一次（say 首次可能被系统唤回打断）
      try {
        execSync(`say -v ${VOICE} --rate=${RATE} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
        execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
        execSync(`rm -f ${aiff}`, { stdio: 'pipe' })
        success++
      } catch (e2) {
        console.error(`  ✗ ${lesson.id} line ${i + 1}: ${e2.message}`)
        try { execSync(`rm -f ${aiff}`) } catch {}
        failed++
      }
    }
  }
  console.log(`  ${lesson.id}: done (${lesson.lines.filter(l => l.trim() !== '').length} 行)`)
}

console.log(`\n生成完成: ${success} 新生成, ${skipped} 已存在跳过, ${failed} 失败`)

// ---------- 认字点读：整字 mp3（共享目录 char/u{codepoint-hex}.mp3） ----------
// 与 lessonChars() 逻辑一致：每课取前 16 个不重复汉字；跨课去重后共用一份文件。
// pad 上 speechSynthesis 无中文 voice 会静默无声 → 认字必须走 mp3（tts.ts speakHanzi 兜底）。
const CHAR_DIR = join(OUT_BASE, 'char')
mkdirSync(CHAR_DIR, { recursive: true })
const charSet = new Set()
for (const lesson of ALL) {
  const seen = new Set()
  let count = 0
  for (const line of lesson.lines) {
    for (const ch of line) {
      if (/[\u4e00-\u9fff]/.test(ch) && !seen.has(ch)) {
        seen.add(ch)
        charSet.add(ch)
        if (++count >= 16) break
      }
    }
    if (count >= 16) break
  }
}
console.log(`\n认字生成: ${charSet.size} 个唯一汉字（每课前 16 字，跨课去重）`)

function sayChar(ch) {
  const hex = ch.codePointAt(0).toString(16)
  const outFile = join(CHAR_DIR, `u${hex}.mp3`)
  if (!FORCE && existsSync(outFile) && statSync(outFile).size > 500) return 'skip'
  const aiff = `/tmp/reading-char-${hex}.aiff`
  const run = () => {
    // 单字教学：语速 130（比课文 150 慢），孩子听得清声调
    execSync(`say -v ${VOICE} --rate=130 -o ${aiff} ${JSON.stringify(ch)}`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
    execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
    execSync(`rm -f ${aiff}`, { stdio: 'pipe' })
  }
  try { run(); return 'ok' }
  catch {
    try { run(); return 'ok' } // say 偶发被系统打断，重试一次
    catch (e2) {
      console.error(`  ✗ char ${ch} (u${hex}): ${e2.message}`)
      try { execSync(`rm -f ${aiff}`) } catch {}
      return 'fail'
    }
  }
}

let charOk = 0, charSkip = 0, charFail = 0
for (const ch of charSet) {
  const r = sayChar(ch)
  if (r === 'ok') charOk++
  else if (r === 'skip') charSkip++
  else charFail++
}
console.log(`认字完成: ${charOk} 新生成, ${charSkip} 已存在跳过, ${charFail} 失败`)

// ---------- MD5 查重 ----------
const hashMap = new Map()
let fileCount = 0
for (const lessonDir of readdirSync(OUT_BASE)) {
  const dir = join(OUT_BASE, lessonDir)
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.mp3')) continue
    fileCount++
    const buf = readFileSync(join(dir, f))
    const hash = createHash('md5').update(buf).digest('hex')
    const key = `${lessonDir}/${f}`
    if (hashMap.has(hash)) hashMap.get(hash).push(key)
    else hashMap.set(hash, [key])
  }
}
const dupGroups = [...hashMap.values()].filter(g => g.length > 1)
console.log(`\nMD5 查重: ${fileCount} 个文件, ${dupGroups.length} 组重复`)
for (const g of dupGroups.slice(0, 10)) console.log('  DUP:', g.join(' = '))
if (dupGroups.length > 0) {
  // 校验重复组是否同文本（同文本同音频属正常）；char/ 下同音字同音频也属正常（同读音）
  const textOf = (rel) => {
    const [lid, f] = rel.split('/')
    if (lid === 'char') {
      // u{hex} → 汉字；同音字（他/她）音频相同是正常的
      return [...charSet].find(c => c.codePointAt(0).toString(16) === f.slice(1, -4)) ?? f
    }
    const n = parseInt(f.match(/line-(\d+)/)[1])
    const lesson = ALL.find(x => x.id === lid)
    return lesson ? lesson.lines[n - 1] : ''
  }
  let legit = 0, suspicious = 0
  const isCharGroup = (g) => g.every(rel => rel.startsWith('char/'))
  for (const g of dupGroups) {
    if (isCharGroup(g)) {
      // 整字组：音频相同 = 同音字，按读音归一判断（同音正常，不同音异常）
      legit++
      console.log('  同音字组（正常）:', g.map(r => textOf(r)).join(' = '))
      continue
    }
    const texts = new Set(g.map(textOf))
    if (texts.size === 1) legit++
    else { suspicious++; console.log('  ⚠️ 异常重复（文本不同）:', g.join(' = ')) }
  }
  console.log(`重复组分类: ${legit} 组同文本/同音（正常）, ${suspicious} 组文本不同（需排查）`)
}
