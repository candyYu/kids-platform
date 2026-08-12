import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useViolinAudio } from '@/hooks/useViolinAudio'
import {
  loadViolinStats,
  addViolinPractice,
  redeemReward,
  type ViolinStats,
} from '@/data/violin-stats'

const GOAL_SECONDS = 600 // 10 分钟一颗星星
const ENCOURAGE_AFTER_MS = 5000 // 停顿 5 秒后给鼓励

const ENCOURAGEMENTS = [
  '加油呀，再试一次～',
  '慢慢来，不着急',
  '小提琴的声音真好听 🎻',
  '你已经很努力了！',
  '活动一下手指，再来一次',
  '喝口水，继续吧～',
  '深深吸一口气，再拉一遍',
  '我相信你可以的！',
]

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function Violin() {
  const audio = useViolinAudio()
  const [running, setRunning] = useState(false)
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [stats, setStats] = useState<ViolinStats | null>(null)
  const [encourage, setEncourage] = useState<string | null>(null)
  const [justEarnedStar, setJustEarnedStar] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [rewardMsg, setRewardMsg] = useState<string | null>(null)

  const silenceStartRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)
  const encourageTimerRef = useRef<number | null>(null)
  const sessionSecAccRef = useRef(0)

  // 载入统计
  useEffect(() => {
    setStats(loadViolinStats())
  }, [])

  // 刷新统计（页面隐藏后回来）
  useEffect(() => {
    const refresh = () => setStats(loadViolinStats())
    window.addEventListener('focus', refresh)
    window.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  const clearEncourageTimer = () => {
    if (encourageTimerRef.current != null) {
      window.clearTimeout(encourageTimerRef.current)
      encourageTimerRef.current = null
    }
  }

  // 主循环：playing 时累计有效秒数
  useEffect(() => {
    if (!running) return
    lastTickRef.current = performance.now()
    let raf = 0
    const loop = () => {
      const now = performance.now()
      const dt = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      if (audio.playing) {
        sessionSecAccRef.current += dt
        // 满 1 秒提交一次，避免频繁写 localStorage
        if (sessionSecAccRef.current >= 1) {
          const whole = Math.floor(sessionSecAccRef.current)
          sessionSecAccRef.current -= whole
          const { newStars } = addViolinPractice(whole)
          setSessionSeconds(s => s + whole)
          setStats(loadViolinStats())
          if (newStars > 0) {
            setJustEarnedStar(true)
            window.setTimeout(() => setJustEarnedStar(false), 3000)
          }
        }
        silenceStartRef.current = null
        setEncourage(null)
        clearEncourageTimer()
      } else if (audio.error == null) {
        // 没在拉：开始/继续计时
        if (silenceStartRef.current == null) silenceStartRef.current = now
        if (!encourageTimerRef.current) {
          encourageTimerRef.current = window.setTimeout(() => {
            const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
            setEncourage(msg)
            encourageTimerRef.current = null
          }, ENCOURAGE_AFTER_MS)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      clearEncourageTimer()
    }
  }, [running, audio.playing, audio.error])

  const start = async () => {
    setEncourage(null)
    setSessionSeconds(0)
    sessionSecAccRef.current = 0
    const ok = await audio.start()
    if (ok) setRunning(true)
  }

  const stop = useCallback(() => {
    audio.stop()
    setRunning(false)
    setEncourage(null)
    silenceStartRef.current = null
    clearEncourageTimer()
    setStats(loadViolinStats())
  }, [audio])

  // 离开页面停掉麦克风
  useEffect(() => () => stop(), [stop])

  const handleRedeem = () => {
    if (!stats || stats.stars < 10 || stats.rewards.length === 0) return
    const reward = stats.rewards[0]
    if (redeemReward(reward)) {
      setStats(loadViolinStats())
      setRewardMsg(`🎁 兑换成功！${reward}`)
      setShowReward(false)
      window.setTimeout(() => setRewardMsg(null), 5000)
    }
  }

  if (!stats) return null

  const progressPct = Math.min(100, (stats.currentProgress / GOAL_SECONDS) * 100)
  const starsToNext = 10 - stats.stars
  const canRedeem = stats.stars >= 10 && stats.rewards.length > 0
  const goalRemaining = Math.max(0, GOAL_SECONDS - stats.currentProgress)

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 顶部 */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <Link to="/" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg active:scale-95">←</Link>
        <h1 className="text-3xl font-bold text-purple-600">🎻 小提琴练习</h1>
      </div>

      {/* 错误提示 */}
      {audio.error && (
        <div className="card mb-4 p-4 bg-red-50 border-2 border-red-200 text-red-600 text-sm">
          {audio.error}
        </div>
      )}

      {/* 主状态区 */}
      <div className="card mb-6 text-center py-8 relative overflow-hidden">
        {justEarnedStar && (
          <div className="absolute inset-0 flex items-center justify-center bg-yellow-100/90 z-10 animate-pulse">
            <div className="text-center">
              <div className="text-7xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-yellow-600">得到一颗星星！</div>
            </div>
          </div>
        )}

        {/* 小提琴图标 */}
        <div className={`text-8xl mb-4 transition-all ${running ? (audio.playing ? 'scale-110' : 'opacity-40 grayscale') : ''}`}>
          {running ? (audio.playing ? '🎻' : '🎻') : '🎻'}
        </div>
        {running && (
          <div className="mb-2">
            {audio.playing ? (
              <span className="inline-flex items-center gap-2 text-green-600 font-bold text-lg">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                正在拉琴
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-gray-400 font-bold text-lg">
                <span className="w-3 h-3 rounded-full bg-gray-300" />
                等待声音
              </span>
            )}
          </div>
        )}

        {/* 本次计时 */}
        <div className="text-6xl font-bold text-purple-600 tabular-nums mb-2">
          {formatTime(sessionSeconds)}
        </div>
        <div className="text-sm text-gray-400 mb-4">
          {running ? '本次有效练习时间' : '准备好了就开始吧'}
        </div>

        {/* 进度条（距离下一颗星星） */}
        {running && (
          <div className="max-w-sm mx-auto mb-4">
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              距离下一颗星星还差 {Math.ceil(goalRemaining / 60)} 分钟
            </div>
          </div>
        )}

        {/* 鼓励语气泡 */}
        {encourage && running && (
          <div className="inline-block bg-pink-100 text-pink-600 px-4 py-2 rounded-2xl text-sm font-bold animate-bounce">
            💗 {encourage}
          </div>
        )}

        {/* 主按钮 */}
        <div className="mt-6">
          {!running ? (
            <button
              onClick={start}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold shadow-lg active:scale-95"
            >
              ▶ 开始练习
            </button>
          ) : (
            <button
              onClick={stop}
              className="px-10 py-4 rounded-2xl bg-gray-600 text-white text-xl font-bold shadow-lg active:scale-95"
            >
              ⏹ 结束练习
            </button>
          )}
        </div>
      </div>

      {/* 星星总览 */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">⭐ 我的星星</h2>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-4xl font-bold text-yellow-500">{stats.stars}</span>
            <span className="text-gray-400 ml-1">颗</span>
          </div>
          <div className="text-sm text-gray-400 text-right">
            已兑换 {stats.redeemed} 次<br/>
            累计练习 {Math.floor(stats.totalSeconds / 60)} 分钟
          </div>
        </div>
        {/* 10 颗进度 */}
        <div className="grid grid-cols-10 gap-1 mb-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="text-center text-2xl">
              {i < stats.stars % 10 || (stats.stars >= 10 && stats.stars % 10 === 0 && i === 0) ? '⭐' : '☆'}
            </div>
          ))}
        </div>
        {canRedeem ? (
          <button
            onClick={() => setShowReward(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold shadow active:scale-95"
          >
            🎁 满 10 颗星星，兑换奖励！
          </button>
        ) : (
          <p className="text-center text-sm text-gray-400">
            再得 <strong className="text-yellow-500">{Math.min(10, starsToNext)}</strong> 颗星星可以兑换奖励
          </p>
        )}
      </div>

      {/* 兑换弹窗 */}
      {showReward && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6" onClick={() => setShowReward(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">🎁</div>
              <h3 className="text-xl font-bold text-gray-700">用 10 颗星星兑换</h3>
              <p className="text-2xl font-bold text-pink-500 mt-2">{stats.rewards[0]}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReward(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold">再想想</button>
              <button onClick={handleRedeem} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">兑换</button>
            </div>
          </div>
        </div>
      )}

      {/* 兑换成功提示 */}
      {rewardMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-lg z-50">
          {rewardMsg}
        </div>
      )}

      {/* 隐私说明 */}
      <p className="text-center text-xs text-gray-400 mt-6">
        🔒 麦克风只在你的手机上分析声音，不会录音或上传
      </p>
    </div>
  )
}
