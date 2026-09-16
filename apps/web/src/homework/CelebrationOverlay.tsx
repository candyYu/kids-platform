// 作业全部完成时的全屏庆祝：佩奇风粉黄配色，大星弹出 + 彩纸 + 三音上行叮咚。
// 纯 CSS 动画 + Web Audio 合成（不依赖任何图片/mp3，pad 静音开关下不保证响，尽力而为）。
import { useEffect, useMemo, useState } from 'react'

interface Props {
  onClose: () => void
}

const CONFETTI_COLORS = ['#FF4781', '#FFCC00', '#7AC74F', '#5BB8E8', '#B98BD8', '#FF8A4C']

// 彩纸只算一次：避免每次 re-render 重新撒
function buildConfetti() {
  return Array.from({ length: 40 }, (_, i) => {
    const left = (i * 97) % 100
    const delay = ((i * 53) % 100) / 100 * 1.8
    const duration = 2.4 + ((i * 31) % 100) / 100 * 1.8
    const size = 7 + ((i * 17) % 8)
    const round = i % 3 === 0
    return {
      left: `${left}%`,
      animationDelay: `${delay.toFixed(2)}s`,
      animationDuration: `${duration.toFixed(2)}s`,
      width: size,
      height: round ? size : size * 0.5,
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      borderRadius: round ? '50%' : '3px',
    } as const
  })
}

// 上行三音 C5-E5-G5（do-mi-sol），清脆短音；任何异常静默，绝不能打扰主流程
function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const notes = [523.25, 659.25, 783.99]
    const start = ctx.currentTime + 0.08
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const t = start + i * 0.14
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.4)
    })
    setTimeout(() => void ctx.close().catch(() => {}), 1500)
  } catch {
    /* 不支持音频就算了，动画照样给反馈 */
  }
}

export default function CelebrationOverlay({ onClose }: Props) {
  const [closing, setClosing] = useState(false)
  const confetti = useMemo(buildConfetti, [])

  useEffect(() => {
    playChime()
    // 兜底：5 秒后自动关，孩子不点也不挡着
    const timer = setTimeout(close, 5200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    setClosing(true)
    // 留 0.2s 淡出
    setTimeout(onClose, 200)
  }

  if (closing) return null

  return (
    <div
      role="dialog"
      aria-label="作业全部完成啦"
      onClick={close}
      className="hw-fade-in fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: 'rgba(255, 71, 129, 0.28)', backdropFilter: 'blur(3px)' }}
    >
      {/* 彩纸层 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="hw-confetti"
            style={{
              left: c.left,
              width: c.width,
              height: c.height,
              background: c.background,
              borderRadius: c.borderRadius,
              animationDelay: c.animationDelay,
              animationDuration: c.animationDuration,
            }}
          />
        ))}
      </div>

      {/* 中心卡片 */}
      <div
        className="hw-card-pop relative bg-white rounded-[2.5rem] border-4 border-sun-300 shadow-2xl px-10 py-9 text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hw-star-pop flex justify-center mb-3">
          <div className="hw-float text-8xl drop-shadow-[0_6px_0_rgba(255,180,0,0.35)]">⭐</div>
        </div>
        <h2 className="text-3xl font-extrabold text-pig-600 mb-1">作业全部完成啦！</h2>
        <p className="text-ink-500 font-bold mb-5">今天也超厉害，奖励你一颗小星星</p>

        <div className="hw-badge-rise inline-flex items-center gap-2 bg-gradient-to-r from-sun-300 to-sun-400 text-white font-extrabold text-xl px-6 py-2.5 rounded-full shadow border-2 border-white">
          ⭐ +1
        </div>

        <button
          type="button"
          onClick={close}
          className="block w-full mt-7 bg-pig-500 text-white text-lg font-extrabold py-3.5 rounded-full shadow active:scale-95 border-b-4 border-pig-600"
        >
          收下星星，太棒啦！
        </button>
        <p className="text-[11px] text-ink-300 mt-2">（点这里或屏幕任意处都可以收下）</p>
      </div>
    </div>
  )
}
