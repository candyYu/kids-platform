// 中文语音读题：Web Speech，选 zh voice（婷婷/Google 优先）
// 借鉴语文应用 tts.ts 的成熟经验：3 秒保底 resolve，避免极端情况卡死

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

/** 读中文文本，返回 Promise（播完或 3 秒保底） */
export function speak(text: string, rate = 0.9): Promise<void> {
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
    const timer = setTimeout(finish, 3000)
    try {
      window.speechSynthesis.cancel()
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
