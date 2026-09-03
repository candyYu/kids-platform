// 英语音频：mp3 优先（pad/WebView 上 speechSynthesis 英文 voice 不可靠），
// index.json 命中表由 scripts/gen-audio.mjs 生成，未命中兜底 Web Speech en-US。
// 铁律：发音交互一律走这里，禁止裸 speechSynthesis；AbortError 排除防双读。

const BASE = import.meta.env.BASE_URL // '/english/'

type Kind = 'word' | 'sent'

interface AudioIndex {
  words: string[]
  sents: string[]
}

let indexPromise: Promise<AudioIndex> | null = null

function loadIndex(): Promise<AudioIndex> {
  if (!indexPromise) {
    indexPromise = fetch(`${BASE}audio/index.json`)
      .then((r) => (r.ok ? r.json() : { words: [], sents: [] }))
      .catch(() => ({ words: [], sents: [] }))
  }
  return indexPromise
}

export function wordSlug(en: string): string {
  return en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

// 与 scripts/gen-audio.mjs 的 readAloud 一致
export function readAloud(s: string): string {
  return s.replace(/\.\.\./g, '').replace(/\s*\/\s*/g, '. ').trim()
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.codePointAt(i) ?? 0
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

// 单例音频：播放新的先停旧的，防双读
let current: HTMLAudioElement | null = null

function stopCurrent() {
  if (current) {
    current.pause()
    current.src = ''
    current = null
  }
}

/** 播放英语单词/句子；返回是否命中本地 mp3（未命中走兜底） */
export async function speakEn(text: string, kind: Kind): Promise<boolean> {
  const idx = await loadIndex()
  let url: string | null = null
  if (kind === 'word') {
    const slug = wordSlug(text)
    if (idx.words.includes(slug)) url = `${BASE}audio/word/${slug}.mp3`
  } else {
    const h = fnv1a(readAloud(text))
    if (idx.sents.includes(h)) url = `${BASE}audio/sent/${h}.mp3`
  }

  if (url) {
    stopCurrent()
    const audio = new Audio(url)
    current = audio
    audio.onerror = () => {
      if (current === audio) stopCurrent()
      fallbackSpeak(text)
    }
    try {
      await audio.play()
    } catch {
      /* play() 被打断不算错误 */
    }
    return true
  }

  fallbackSpeak(text)
  return false
}

function fallbackSpeak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.8
    // 选 en voice（若设备有）
    const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith('en'))
    if (v) u.voice = v
    speechSynthesis.cancel()
    speechSynthesis.speak(u)
  } catch {
    /* pad 无英文 voice 时静默：正常情况 mp3 已全覆盖 */
  }
}

export function stopEn() {
  stopCurrent()
  try {
    speechSynthesis.cancel()
  } catch {
    /* ignore */
  }
}
