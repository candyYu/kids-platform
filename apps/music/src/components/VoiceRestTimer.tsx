import { useState, useEffect } from 'react'

const REST_INTERVAL = 15 * 60 * 1000 // 15 分钟
const WARN_INTERVAL = 20 * 60 * 1000 // 20 分钟强制提醒

/**
 * 嗓音保护计时器
 * - 15 分钟后弹出"喝口水休息一下"提醒
 * - 20 分钟后强制遮罩，必须休息
 * - 点击"去休息"重置计时器
 */
export default function VoiceRestTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const timer = setInterval(() => {
      setElapsed(Date.now() - start)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 重置后重新计时
  const reset = () => {
    setDismissed(false)
    setElapsed(0)
    // 重新挂载 effect：用一个 key trick
    window.location.reload()
  }

  const showWarn = elapsed >= REST_INTERVAL && !dismissed
  const showForce = elapsed >= WARN_INTERVAL

  if (showForce) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-sm text-center mx-4">
          <div className="text-6xl mb-4">🥤</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">该休息啦！</h2>
          <p className="text-gray-500 mb-6">
            你已经练习了 20 分钟了，嗓子需要休息一下。<br />
            喝口水，休息 5 分钟再继续吧～
          </p>
          <button onClick={reset} className="btn-primary w-full">
            好的，我去休息
          </button>
        </div>
      </div>
    )
  }

  if (showWarn) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-orange-500 text-white rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 max-w-sm">
        <span className="text-2xl">💧</span>
        <div className="flex-1">
          <p className="text-sm font-bold">该喝口水啦～</p>
          <p className="text-xs opacity-90">已练习 15 分钟，休息一下嗓子</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs bg-white/20 rounded-full px-3 py-1 hover:bg-white/30"
        >
          知道了
        </button>
      </div>
    )
  }

  return null
}
