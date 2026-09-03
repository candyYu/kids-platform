// 生成英语朗读 mp3：单词（word/）+ 整句（sent/）
// 运行：node scripts/gen-audio.mjs（macOS say Samantha + ffmpeg）
// 单词文件名 = slug(en)；整句文件名 = fnv1a(readAloud 后文本) 8 位 hex，与运行时 src/audio/tts.ts 保持一致
// 增量生成：文件已存在则跳过；删掉某文件重跑即可单条重生成
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'audio')
const WORD = join(OUT, 'word')
const SENT = join(OUT, 'sent')
const VOICE = 'Samantha'
const RATE_WORD = 150 // 单词：慢速清晰
const RATE_SENT = 155 // 整句：稍慢，适合一年级跟读

mkdirSync(WORD, { recursive: true })
mkdirSync(SENT, { recursive: true })

// ---------- 与 src/audio/tts.ts 保持一致 ----------
function fnv1a(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function wordSlug(en) {
  return en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// 朗读版文本：去掉省略号；并列斜杠读成句号停顿（显示不变）
export function readAloud(s) {
  return s.replace(/\.\.\./g, '').replace(/\s*\/\s*/g, '. ').trim()
}

function synth(text, outFile, rate) {
  const aiff = `/tmp/eng-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.aiff`
  execSync(`say -v ${VOICE} --rate=${rate} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
  execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
  execSync(`rm -f ${aiff}`)
}

// ---------- 数据源：从 units.ts 源码逐行抽取（源文件机械格式，可靠） ----------
const src = readFileSync(join(ROOT, 'src', 'data', 'units.ts'), 'utf8')
const words = new Set()
const sents = new Set()
{
  let inWords = false
  for (const line of src.split('\n')) {
    if (/^\s*words:\s*\[/.test(line)) { inWords = true; continue }
    if (/^\s*sentences:\s*\[/.test(line)) { inWords = false; continue }
    // 数据里两种字符串形式：'xxx' 与 "What's ..."（含直撇号的句子用双引号）
    const m =
      line.match(/\ben:\s*'((?:[^'\\]|\\.)*)'/) ||
      line.match(/\ben:\s*"((?:[^"\\]|\\.)*)"/)
    if (m) {
      const raw = m[1].replace(/\\'/g, "'")
      const text = JSON.parse('"' + raw.replace(/"/g, '\\"') + '"')
      if (inWords) words.add(text)
      else sents.add(text)
    }
  }
}

console.log(`解析：${words.size} 词 / ${sents.size} 句`)

// ---------- 1. 单词 ----------
let made = 0
for (const w of words) {
  const slug = wordSlug(w)
  const f = join(WORD, `${slug}.mp3`)
  if (existsSync(f)) continue
  // "a/an" 这类词条朗读为 "a, an"
  const spoken = w.includes('/') ? w.replace(/\s*\/\s*/g, ', ') : w
  synth(spoken, f, RATE_WORD)
  made++
}
console.log(`单词：${words.size} 个（新生成 ${made}）`)

// ---------- 2. 整句 ----------
const byHash = new Map()
made = 0
for (const s of sents) {
  const spoken = readAloud(s)
  const h = fnv1a(spoken)
  if (byHash.has(h) && byHash.get(h) !== s) {
    throw new Error(`fnv 哈希冲突：${h} → "${byHash.get(h)}" vs "${s}"`)
  }
  byHash.set(h, s)
  const f = join(SENT, `${h}.mp3`)
  if (existsSync(f)) continue
  synth(spoken, f, RATE_SENT)
  made++
}
console.log(`整句：${sents.size} 条（新生成 ${made}）`)

// ---------- 3. MD5 查重（不同文本不应同音频） ----------
{
  const byMd5 = new Map()
  for (const [h] of byHash) {
    const f = join(SENT, `${h}.mp3`)
    const md5 = createHash('md5').update(readFileSync(f)).digest('hex')
    if (!byMd5.has(md5)) byMd5.set(md5, [])
    byMd5.get(md5).push(h)
  }
  const dups = [...byMd5.values()].filter((v) => v.length > 1)
  if (dups.length) console.log(`警告：整句 MD5 重复 ${dups.length} 组`, dups)
  else console.log('MD5 查重：无重复')
  const wMd5 = new Map()
  for (const w of words) {
    const f = join(WORD, `${wordSlug(w)}.mp3`)
    const md5 = createHash('md5').update(readFileSync(f)).digest('hex')
    if (!wMd5.has(md5)) wMd5.set(md5, [])
    wMd5.get(md5).push(w)
  }
  const wDups = [...wMd5.values()].filter((v) => v.length > 1)
  if (wDups.length) console.log(`警告：单词 MD5 重复 ${wDups.length} 组`, wDups)
  else console.log('单词 MD5 查重：无重复')
}

// ---------- 4. index.json（运行时命中表） ----------
writeFileSync(
  join(OUT, 'index.json'),
  JSON.stringify({ words: [...words].map(wordSlug), sents: [...byHash.keys()] }),
  'utf8'
)
console.log(`index.json：${words.size} 词 + ${byHash.size} 句`)

// ---------- 5. 孤儿文件提示 ----------
{
  const orphanW = readdirSync(WORD).filter((f) => f.endsWith('.mp3') && ![...words].map(wordSlug).includes(f.replace('.mp3', '')))
  const orphanS = readdirSync(SENT).filter((f) => f.endsWith('.mp3') && !byHash.has(f.replace('.mp3', '')))
  if (orphanW.length || orphanS.length) console.log(`警告：孤儿文件 word ${orphanW.length} / sent ${orphanS.length}`)
  else console.log('孤儿文件：无')
}
