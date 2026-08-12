import { useState, useEffect, useRef } from 'react'

const REST_INTERVAL = 20 * 60 * 1000 // 20 分钟提醒一次

/**
 * 嗓音保护提醒
 * - 每 20 分钟弹出一次温和提醒（不挡操作）
 * - 点"知道了"重置计时器，再练 20 分钟才会再次提醒
 */
export default function VoiceRestTimer() {
  const [show, setShow] = useState(false)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - startRef.current >= REST_INTERVAL) {
        setShow(true)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const dismiss = () => {
    startRef.current = Date.now()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-orange-500 text-white rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 max-w-sm">
      <span className="text-2xl">💧</span>
      <div className="flex-1">
        <p className="text-sm font-bold">该喝口水休息一下啦～</p>
        <p className="text-xs opacity-90">已经练习 20 分钟，让嗓子歇一会儿</p>
      </div>
      <button
        onClick={dismiss}
        className="text-xs bg-white/20 rounded-full px-3 py-1 hover:bg-white/30"
      >
        知道了
      </button>
    </div>
  )
}
