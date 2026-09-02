// 中文语音读题：mp3 优先（pad 上 speechSynthesis 无中文 voice 会静默无声）
// 三层链路（同语文应用 mp3 优先原则）：
//   1. 整句 mp3：静态文本（课本卡片）预生成，查 audio/index.json（fnv1a 哈希命中）
//   2. 切片拼接：动态口算题（数字 0~99 + 运算词）逐段播 audio/slice/*.mp3
//   3. Web Speech 兜底：桌面 Chrome 有中文 voice 时才响，选婷婷/Google 优先
// 注意：fnv1a 必须与 scripts/gen-audio.mjs 保持一致（文件名 = 哈希）
import { numToCn } from '@/data/topics'

// ---------- 哈希（与 gen-audio.mjs 一致） ----------
function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i)!
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const BASE = import.meta.env.BASE_URL  // '/math/'（dev 与线上一致）

// ---------- 整句清单（启动异步加载） ----------
let sentSet: Set<string> | null = null
const sentReady = (async () => {
  try {
    const r = await fetch(`${BASE}audio/index.json`)
    sentSet = new Set(r.ok ? await r.json() : [])
  } catch {
    sentSet = new Set()
  }
})()
async function ensureSent(): Promise<void> {
  await Promise.race([sentReady, new Promise<void>(r => setTimeout(r, 1500))])
}

// ---------- 切片词典：数字 0~99 + 运算词 ----------
const SLICE_DICT: Record<string, string> = {}
for (let n = 0; n <= 99; n++) SLICE_DICT[numToCn(n)] = `n${n}`
Object.assign(SLICE_DICT, {
  '加': 'add', '减': 'sub', '乘': 'mul', '除以': 'div',
  '等于': 'eq', '等于几': 'eqq', '大于': 'gt', '小于': 'lt',
  '几': 'how', '多少': 'howmuch', '和': 'he', '余数是几': 'rem',
})

/** 贪婪最长匹配切词；全部命中返回切片键数组，任一词不在词典返回 null */
function tokenize(text: string): string[] | null {
  const toks: string[] = []
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if ('，。！？、,.!?;；:：＂"\'…—~～ 　'.includes(ch)) { i++; continue }
    let matched = false
    for (let len = 4; len >= 1; len--) {
      const w = text.slice(i, i + len)
      const key = SLICE_DICT[w]
      if (key) { toks.push(key); i += len; matched = true; break }
    }
    if (!matched) return null
  }
  return toks
}

// ---------- mp3 播放 ----------
let curAudio: HTMLAudioElement | null = null
let curStop: (() => void) | null = null

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** 播一个 mp3；成功/被打断返回 true（不再走兜底），失败返回 false（走兜底） */
function playMp3(url: string, timeoutMs: number): Promise<boolean> {
  return new Promise(resolve => {
    let done = false
    const fin = (ok: boolean) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (curStop === stop) curStop = null
      resolve(ok)
    }
    const stop = () => fin(true)  // 被新一轮播放打断：视为已处理，禁止触发兜底（防双读）
    const timer = setTimeout(() => fin(true), timeoutMs)  // android webview ended 可能不触发，保底放行
    const a = new Audio(url)
    curAudio = a
    curStop = stop
    a.onended = () => fin(true)
    a.onerror = () => fin(false)
    a.play().catch((e: DOMException) => {
      if (e.name === 'NotAllowedError') fin(false)  // autoplay 被拦 → 走 Web Speech
      // AbortError = 被打断，stop() 已处理，忽略
    })
  })
}

/** 停掉当前播放（mp3 + Web Speech） */
export function stopAllAudio(): void {
  if (curStop) { const s = curStop; curStop = null; s() }
  if (curAudio) {
    const a = curAudio
    a.onended = null
    a.onerror = null
    try { a.pause(); a.removeAttribute('src'); a.load() } catch { /* ignore */ }
    curAudio = null
  }
  try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
}

// ---------- Web Speech 兜底 ----------
let cachedVoice: SpeechSynthesisVoice | null = null

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) return cachedVoice // 用缓存兜底
  const zh = voices.filter(v => v.lang.toLowerCase().startsWith('zh'))
  if (zh.length === 0) return null
  const preferred = zh.find(v => /婷婷|ting-?ting|美嘉|meijia|语舒|yaoyao|huihui/i.test(v.name))
  return preferred ?? zh.find(v => /google/i.test(v.name)) ?? zh[0]
}

// voices 异步加载：模块加载 + voiceschanged 都刷新缓存
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoice = pickChineseVoice()
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickChineseVoice()
  }
}

function webSpeech(text: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve()
      return
    }
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        clearTimeout(timer)
        resolve()
      }
    }
    // 保底时长随文本增长：约 4 字/秒，按 300ms/字 + 1s 余量
    const timer = setTimeout(finish, Math.max(3000, text.length * 300 + 1000))
    try {
      const u = new SpeechSynthesisUtterance(text)
      const v = cachedVoice ?? pickChineseVoice()
      if (v) {
        u.voice = v
        cachedVoice = v
      }
      u.lang = 'zh-CN'
      u.rate = rate
      u.onend = finish
      u.onerror = finish
      window.speechSynthesis.speak(u)
    } catch {
      clearTimeout(timer)
      finish()
    }
  })
}

// ---------- 对外接口（签名不变，LessonPage/Practice 零改动） ----------

/**
 * 把含数学符号/阿拉伯数字的文本转成可靠的中文读法
 * '3 × 5 = 15' → '三乘五等于十五'；'3 > 2' → '三大于二'；'三五（　）' → '三五多少'
 */
export function readAloud(text: string): string {
  return text
    .replace(/(\d+)/g, n => numToCn(Number(n)))
    .replace(/×/g, '乘')
    .replace(/\+/g, '加')
    .replace(/[−-]/g, '减')
    .replace(/÷/g, '除以')
    .replace(/=\s*\?/g, '等于几')
    .replace(/=/g, '等于')
    .replace(/>/g, '大于')
    .replace(/</g, '小于')
    .replace(/（　）/g, '多少')
    .replace(/\?/g, '几')
}

/** 读中文文本（mp3 优先），返回 Promise（播完或保底） */
export async function speak(text: string, rate = 0.9): Promise<void> {
  stopAllAudio()
  const t = text.trim()
  if (!t) return
  await ensureSent()
  // 1. 整句 mp3（静态文本）
  const h = fnv1a(t)
  if (sentSet?.has(h) && await playMp3(`${BASE}audio/sent/${h}.mp3`, 12000)) return
  // 2. 切片拼接（动态口算题）
  const toks = tokenize(t)
  if (toks) {
    let ok = true
    for (let i = 0; i < toks.length; i++) {
      if (i > 0) await sleep(120)
      if (!await playMp3(`${BASE}audio/slice/${toks[i]}.mp3`, 3000)) { ok = false; break }
    }
    if (ok) return
  }
  // 3. Web Speech 兜底
  await webSpeech(t, rate)
}

/**
 * 逐行分段朗读（teach 卡用）：一行读完再读下一行，给孩子消化时间
 * 返回取消函数：组件卸载时调用，停止后续行
 */
export function speakLines(lines: string[], rate = 0.85): () => void {
  let alive = true
  void (async () => {
    for (const ln of lines) {
      if (!alive) return
      await speak(readAloud(ln), rate)
    }
  })()
  return () => {
    alive = false
    stopAllAudio()
  }
}
