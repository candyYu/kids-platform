// 生成数学朗读 mp3：静态整句（texts.json）+ 动态切片（数字 0~99 / 运算词）
// 运行：node scripts/gen-audio.mjs（macOS say Tingting + ffmpeg）
// 整句文件名 = fnv1a(readAloud 后文本) 8 位 hex，与运行时 tts.ts 的 fnv1a 必须一致
// 增量生成：文件已存在则跳过；删掉某文件重跑即可单条重生成
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'audio')
const SENT = join(OUT, 'sent')
const SLICE = join(OUT, 'slice')
const VOICE = 'Tingting'
const RATE_SENT = 140   // 整句：读题语速
const RATE_SLICE = 130  // 单词切片：稍慢，口算拼接时更清晰

mkdirSync(SENT, { recursive: true })
mkdirSync(SLICE, { recursive: true })

// ---------- 与 src/tts.ts 保持一致的 fnv1a ----------
function fnv1a(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

// ---------- 与 src/data/topics.ts numToCn 保持一致 ----------
const DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
function numToCn(n) {
  if (n < 10) return DIGITS[n]
  const tens = Math.floor(n / 10), ones = n % 10
  const t = tens === 1 ? '十' : DIGITS[tens] + '十'
  return ones === 0 ? t : t + DIGITS[ones]
}

function synth(text, outFile, rate) {
  const aiff = `/tmp/math-tts-${Date.now()}-${Math.random().toString(36).slice(2)}.aiff`
  execSync(`say -v ${VOICE} --rate=${rate} -o ${aiff} ${JSON.stringify(text)}`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
  execSync(`ffmpeg -y -i ${aiff} -codec:a libmp3lame -qscale:a 2 -ac 1 ${outFile} 2>/dev/null`, { stdio: 'pipe', timeout: 30000, killSignal: 'SIGKILL' })
  execSync(`rm -f ${aiff}`)
}

// ---------- 1. 切片：数字 0~99 + 运算词/常用词 ----------
const slices = []
for (let n = 0; n <= 99; n++) slices.push([numToCn(n), `n${n}`])
slices.push(
  ['加', 'add'], ['减', 'sub'], ['乘', 'mul'], ['除以', 'div'],
  ['等于', 'eq'], ['等于几', 'eqq'], ['大于', 'gt'], ['小于', 'lt'],
  ['几', 'how'], ['多少', 'howmuch'], ['和', 'he'], ['余数是几', 'rem'],
)
let made = 0
for (const [word, key] of slices) {
  const f = join(SLICE, `${key}.mp3`)
  if (existsSync(f)) continue
  synth(word, f, RATE_SLICE)
  made++
}
console.log(`切片：${slices.length} 个词（新生成 ${made}）`)

// ---------- 2. 整句：texts.json（已是 readAloud 后文本） ----------
const texts = JSON.parse(readFileSync(join(ROOT, 'scripts', 'texts.json'), 'utf8'))
const byHash = new Map()
const md5ToTexts = new Map()
made = 0
for (const t of texts) {
  const h = fnv1a(t)
  if (byHash.has(h) && byHash.get(h) !== t) {
    throw new Error(`fnv 哈希冲突：${h} → "${byHash.get(h)}" vs "${t}"`)
  }
  byHash.set(h, t)
  const f = join(SENT, `${h}.mp3`)
  if (existsSync(f)) continue
  synth(t, f, RATE_SENT)
  made++
}
console.log(`整句：${texts.length} 条（新生成 ${made}）`)

// ---------- 3. MD5 查重（内容审查：不同文本不应同音频） ----------
const byMd5 = new Map()
for (const [h, t] of byHash) {
  const f = join(SENT, `${h}.mp3`)
  const md5 = createHash('md5').update(readFileSync(f)).digest('hex')
  if (!byMd5.has(md5)) byMd5.set(md5, [])
  byMd5.get(md5).push(t)
}
const dups = [...byMd5.values()].filter(v => v.length > 1)
console.log(`MD5 查重：${dups.length} 组同音频`)

// ---------- 4. index.json（运行时整句命中表） ----------
writeFileSync(join(OUT, 'index.json'), JSON.stringify([...byHash.keys()]), 'utf8')
console.log(`index.json：${byHash.size} 条`)

// ---------- 5. 孤儿文件清理提示 ----------
const orphan = readdirSync(SENT).filter(f => f.endsWith('.mp3') && !byHash.has(f.replace('.mp3', '')))
if (orphan.length) console.log(`警告：${orphan.length} 个孤儿整句文件（文本已不在清单，可手动删除）`)
