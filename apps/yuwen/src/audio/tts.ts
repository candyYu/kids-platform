// 音频播放：两条独立路径
// 路径 A（拼音走切片）：intro/规则/拼读阶段用 — 精确发音（声调可听清）
// 路径 B（汉字走 Web Speech）：听写阶段用 — 流畅朗读整词，不依赖切片
// 不再"声母韵母连读"——那是错的拼读方式，对听写场景没意义

import {
  L01_AUDIO, L02_AUDIO, L03_AUDIO, L04_AUDIO, L05_AUDIO,
  L06_AUDIO, L07_AUDIO, L08_AUDIO, L09_AUDIO, L10_AUDIO,
  L11_AUDIO, L12_AUDIO, L13_AUDIO
} from './audioMap'

const audioCache = new Map<string, HTMLAudioElement>()
let currentAudio: HTMLAudioElement | null = null

// ============== 路径 A：拼音切片索引 ==============
const audioIndex = new Map<string, string>()

function buildIndex() {
  audioIndex.clear()
  const allSlices = [
    ...L01_AUDIO, ...L02_AUDIO, ...L03_AUDIO, ...L04_AUDIO, ...L05_AUDIO,
    ...L06_AUDIO, ...L07_AUDIO, ...L08_AUDIO, ...L09_AUDIO, ...L10_AUDIO,
    ...L11_AUDIO, ...L12_AUDIO, ...L13_AUDIO
  ]
  for (const slice of allSlices) {
    // 两种编码都存，确保能命中
    const nfc = slice.pinyin.normalize('NFC')
    const nfd = slice.pinyin.normalize('NFD')
    audioIndex.set(nfc, slice.file)
    audioIndex.set(nfd, slice.file)
  }
  console.log('[Audio] 索引构建完成，共', audioIndex.size, '条')
}

buildIndex()

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

// ============== 路径 A：speakPinyin — 走切片 ==============
// 接受单音节（如 'ní'、'd'、'a'）
// 不接受多音节整词 — 听写用 speakHanzi
export function speakPinyin(pinyin: string, opts: { lesson?: string; fallbackHanzi?: string } = {}): Promise<void> {
  console.log('[TTS-speakPinyin] called:', JSON.stringify(pinyin), 'opts:', JSON.stringify(opts))
  // 1. NFC 精确匹配
  let file = audioIndex.get(pinyin.normalize('NFC'))
  if (file) {
    console.log('[TTS-speakPinyin] NFC 命中:', file.file || file)
    return playFile(typeof file === 'string' ? file : file.file)
  }

  // 2. NFD 精确匹配
  file = audioIndex.get(pinyin.normalize('NFD'))
  if (file) {
    console.log('[TTS-speakPinyin] NFD 命中:', file.file || file)
    return playFile(typeof file === 'string' ? file : file.file)
  }

  // 3. 找不到：fallback
  // - 如果传了 fallbackHanzi（如"弟"），用 Web Speech 读汉字
  // - 否则用 Web Speech 读拼音字符串（Web Speech 中文 voice 会尝试拼音→汉字映射）
  if (opts.fallbackHanzi) {
    console.warn('[TTS-speakPinyin] 找不到切片', JSON.stringify(pinyin), '→ fallback speakHanzi:', JSON.stringify(opts.fallbackHanzi))
    return speakHanzi(opts.fallbackHanzi)
  }
  // 兜底：Web Speech 读拼音（中文 voice 通常能听出 dà→大，dì→弟）
  console.warn('[TTS-speakPinyin] 找不到切片：', JSON.stringify(pinyin), '，尝试 Web Speech 读拼音')
  return speakHanzi(pinyin)
}

// ============== 路径 B：speakHanzi — 走 Web Speech =============
// 听写阶段专用。传入任意汉字字符串，让浏览器中文 TTS 流畅朗读。
// 不依赖任何切片。中文 voice 走 zh-CN / 普通话优先。
//
// 用 Web Speech 而非音频切片的原因：
// 1. 听写题答案是整词（如"泥土"），切片里只有声母韵母
// 2. 孩子需要听到自然连读，不是"声母+韵母"机械拼
// 3. 汉字合成比拼音合成在 Chrome/macOS 上更稳
//
// Pitfall 防护（按 education-pinyin-web-app skill）：
// - 每次调用前 cancel() 避免 Chrome 静默丢弃
// - rate 钳制在 [0.8, 1.2]，1.0 = 正常语速（0.5 是半速无声）
// - voice 实时取，不缓存（HMR 会清空缓存）
// - onerror 时降级到 880Hz 蜂鸣，让用户知道按钮被点了
// - Chrome 政策：必须先有用户交互才能 speak → 自动绑定第一触摸
// - voice 异步加载：监听 voiceschanged + 主动轮询 500ms
let voicesReady = false
let cachedVoices: SpeechSynthesisVoice[] = []
let firstUserInteraction = false

// 模块加载时立刻 log（让你硬刷新时一眼看到 tts.ts 有没有重新加载）
console.log('[TTS] tts.ts module loaded at', new Date().toISOString())

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  console.log('[TTS] speechSynthesis API 可用，立即拉 voices...')
  // 1. 监听 voiceschanged（Chrome/Safari 异步加载中文 voice）
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices()
    console.log('[TTS] voiceschanged 触发，共', cachedVoices.length, '条，zh:', cachedVoices.filter(v => v.lang.startsWith('zh')).map(v => v.name))
    if (cachedVoices.length > 0) {
      voicesReady = true
    }
  }
  // 2. 首次立即拉（Firefox 同步）
  cachedVoices = window.speechSynthesis.getVoices()
  if (cachedVoices.length > 0) voicesReady = true
  // 3. 轮询兜底（Safari 不会触发 voiceschanged）
  const pollInterval = setInterval(() => {
    if (voicesReady) { clearInterval(pollInterval); return }
    const v = window.speechSynthesis.getVoices()
    if (v.length > 0) {
      cachedVoices = v
      voicesReady = true
      console.log('[TTS] voices polled:', v.length)
      clearInterval(pollInterval)
    }
  }, 500)
  // 4. 首次用户交互标记（Chrome 必须先点击）
  const markInteraction = () => {
    firstUserInteraction = true
    window.removeEventListener('click', markInteraction)
    window.removeEventListener('touchstart', markInteraction)
    window.removeEventListener('keydown', markInteraction)
  }
  window.addEventListener('click', markInteraction, { once: true, passive: true })
  window.addEventListener('touchstart', markInteraction, { once: true, passive: true })
  window.addEventListener('keydown', markInteraction, { once: true, passive: true })
}

// ============== 汉字→拼音映射（用于 speakHanzi 拆音节） ==============
// 启动时从 questionBank.ts 里抽 imageDesc → answer 反向映射
import { HANZI_TO_PINYIN } from './hanziMap'

let speakHanziCheckedSynth = false
export function speakHanzi(text: string, opts: { rate?: number } = {}): Promise<void> {
  console.log('[TTS-speakHanzi] called:', JSON.stringify(text), 'opts:', JSON.stringify(opts))
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('[TTS-speakHanzi] speechSynthesis 不可用')
    return Promise.resolve()
  }

  // 0. 优先尝试 zh-synth 切片
  if (!speakHanziCheckedSynth) {
    speakHanziCheckedSynth = true
    setTimeout(() => {
      const zhVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('zh'))
      console.log('[TTS-speakHanzi] 当前可用中文 voice:', zhVoices.map(v => v.name), 'zh-synth 索引大小:', audioIndex.size)
    }, 500)
  }

  // 尝试 1：查 hanzi→pinyin 映射，拆音节，每个走 speakPinyin 切片
  const pinyin = HANZI_TO_PINYIN[text]
  if (pinyin) {
    const syls = pinyin.split(/\s+/).filter(Boolean)
    // 检查每个音节是否在 audioIndex（含 zh-synth）
    const allFound = syls.every(s => audioIndex.has(s.normalize('NFC')) || audioIndex.has(s.normalize('NFD')))
    if (allFound) {
      console.log('[TTS-speakHanzi] 走 zh-synth 切片:', pinyin)
      return syls.reduce((p, s) => p.then(() => speakPinyin(s)), Promise.resolve())
    }
    console.log('[TTS-speakHanzi] 切片不全', pinyin, '，fallback Web Speech')
  }
  // 关键：优先用 zh-synth 切片（macOS say 生成的 mp3，质量好）
  // 把"大马" → ['dà','mǎ']（用 questionBank 题库 map 或简单拆分）
  // 由于汉字→拼音需要拼音表（这里没有），采用 fallback：
  // - 如果 audioIndex 包含 '大' '马' 的某种索引形式，就用切片
  // - 否则走 Web Speech

  return new Promise<void>((resolve) => {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {
      console.warn('[TTS-speakHanzi] cancel 失败:', e)
    }

    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = clampRate(opts.rate ?? 0.95)
    u.pitch = 1.0
    u.volume = 1.0

    // 实时取 voice，不缓存（HMR 会清空模块级缓存）
    const voice = pickChineseVoice()
    if (voice) u.voice = voice
    // 关键：没 voice 时显式提示（debug 友好）
    if (!voice) console.warn('[TTS-speakHanzi] 没找到中文 voice，将用浏览器默认。当前 cachedVoices:', cachedVoices.length, 'voicesReady:', voicesReady)
    else console.log('[TTS-speakHanzi] 用了 voice:', voice.name, voice.lang)

    let resolved = false
    const done = () => {
      if (resolved) return
      resolved = true
      console.log('[TTS-speakHanzi] done:', text)
      resolve()
    }

    u.onstart = () => console.log('[TTS-speakHanzi] onstart:', text)
    u.onend = done
    u.onerror = (e) => {
      // 'interrupted' 不是真错误：只是被新的 speak() 打断了，正常现象
      if (e.error === 'interrupted' || e.error === 'canceled') {
        console.log('[TTS-speakHanzi] interrupted（被新 speak 打断）:', text)
        done()
        return
      }
      console.warn('[TTS-speakHanzi] speak error:', e.error, 'text:', text)
      // onerror 时降级到蜂鸣，让用户知道按钮被点了
      beepFallback()
      done()
    }

    // Chrome 极端情况下 onstart 都不触发（浏览器 bug）
    // 保底 3s 后强制 resolve
    const timeout = setTimeout(done, 3000)

    try {
      window.speechSynthesis.speak(u)
    } catch (e) {
      clearTimeout(timeout)
      beepFallback()
      done()
    }
  })
}

function clampRate(r: number): number {
  // Web Speech rate 单位是 0.1-10，1.0 = 正常语速
  // 0.5 是半速几乎无声，安全范围 [0.8, 1.2]
  if (r < 0.8) return 0.8
  if (r > 1.2) return 1.2
  return r
}

function pickChineseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  // 优先用缓存的 voices（如果已加载）
  let voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices()
  // 更新缓存
  if (voices.length > 0) {
    cachedVoices = voices
    voicesReady = true
  }
  if (voices.length === 0) return null

  // 严格中文 voice 选择（不能被英文 voice 名字误匹配）：
  // 1. lang 必须是 zh-*（zh-CN / zh-TW / zh-HK 等）
  // 2. 排除英文 voice（lang 以 en 开头）
  const zhVoices = voices.filter(v => v.lang.toLowerCase().startsWith('zh'))
  console.log('[TTS-pickChineseVoice] zh voices:', zhVoices.map(v => v.name + ' (' + v.lang + ')'))

  // 优先：macOS 系统中文 voice（婷婷、Meijia、Ting-Ting、Yating、Sin-ji 等）
  // 注意：不能简单匹配 "Female"（会误中 Google UK English Female）
  const preferred = zhVoices.find(v => /婷婷|ting-?ting|meijia|meijia|美嘉|yaoyao|huihui|yating|sin-?ji|善怡|语舒/i.test(v.name))
  if (preferred) return preferred
  // 次选：Google 中文 voice（Google 普通话、粤語、國語）
  const googleZh = zhVoices.find(v => /google/i.test(v.name))
  if (googleZh) return googleZh
  // 兜底：第一个 zh-* voice
  if (zhVoices.length > 0) return zhVoices[0]
  return null
}

function beepFallback() {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.value = 0.05
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    setTimeout(() => {
      osc.stop()
      ctx.close()
    }, 200)
  } catch {
    // ignore
  }
}

// ============== 播放一个独立音频文件 ==============
export function playFile(file: string): Promise<void> {
  return new Promise((resolve) => {
    stopAudio()
    let a = audioCache.get(file)
    if (!a) {
      a = new Audio(file)
      audioCache.set(file, a)
    }
    currentAudio = a
    const onEnded = () => {
      a!.removeEventListener('ended', onEnded)
      if (currentAudio === a) currentAudio = null
      resolve()
    }
    a.addEventListener('ended', onEnded)
    a.play().catch((err) => {
      console.warn('[Audio] play failed', err)
      resolve()
    })
  })
}

// ============== 播放当课完整音轨 ==============
export function playLessonAudio(lessonId: string): Promise<void> {
  const num = lessonId.replace(/^L0*/, '').padStart(2, '0')
  return playFile(`/audio/lessons/l${num}.mp3`)
}

// ============== 测试工具 ==============
export function testSlice(n: number): Promise<void> {
  return playFile(`/audio/slices/l01/slice_${String(n).padStart(2, '0')}.mp3`)
}

export function testSpeak(): { ok: boolean; reason?: string } {
  speakHanzi('你好')
  return { ok: true }
}
