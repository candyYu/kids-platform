// 中文语音读题：Web Speech，选 zh voice（婷婷/Google 优先）
// 借鉴语文应用 tts.ts 的成熟经验：保底 resolve，避免极端情况卡死
import { numToCn } from '@/data/topics'

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

/** 读中文文本，返回 Promise（播完或按文本长度保底） */
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
    // 保底时长随文本增长：rate 0.9 约 4 字/秒，按 300ms/字 + 1s 余量
    const timer = setTimeout(finish, Math.max(3000, text.length * 300 + 1000))
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
    try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
  }
}
