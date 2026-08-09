// 家长端：PIN 锁 + 进度报告 + 设置
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { BADGES } from '@/utils/badges'

export default function ParentDashboardPage() {
  const [pinInput, setPinInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const settings = useLiveQuery(() => db.settings.get('singleton'), [])

  useEffect(() => {
    // 简单方式：URL 加 ?pin=0000 直接进入
    const params = new URLSearchParams(window.location.search)
    if (params.get('pin') === (settings?.pin || '0000')) {
      setUnlocked(true)
    }
  }, [settings])

  if (!settings) {
    return <main className="p-6"><p>加载中...</p></main>
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-bubble p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-child font-bold text-gray-700 mb-2">家长入口</h1>
          <p className="text-sm text-gray-500 mb-6">请输入 4 位 PIN（默认 0000）</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            className="w-full text-center text-3xl tracking-widest p-3 border-2 border-gray-300 rounded-soft"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            onClick={async () => {
              if (pinInput === settings.pin) {
                setUnlocked(true)
                setError('')
              } else {
                setError('PIN 不对')
                setPinInput('')
              }
            }}
            className="w-full mt-4 py-3 bg-gray-700 text-white rounded-soft font-bold"
          >
            进入
          </button>
          <Link to="/" className="block mt-4 text-sm text-gray-400">返回</Link>
        </div>
      </main>
    )
  }

  return (
    <ParentDashboardContent />
  )
}

function ParentDashboardContent() {
  const lessons = useLiveQuery(() => db.lessons.toArray(), []) || []
  const errors = useLiveQuery(() => db.errorItems.toArray(), []) || []
  const badges = useLiveQuery(() => db.badges.toArray(), []) || []
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().limit(20).toArray(), []) || []
  const streak = useLiveQuery(() => db.streak.get('singleton'), [])

  // 统计
  const totalLessons = lessons.length
  const completedLessons = lessons.filter(l => l.stars > 0).length
  const totalQuestions = sessions.reduce((s, x) => s + (x.itemsAnswered || 0), 0)
  const totalCorrect = sessions.reduce((s, x) => s + (x.itemsCorrect || 0), 0)
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  // 错题按课统计
  const errorsByLesson: Record<string, number> = {}
  for (const e of errors) {
    errorsByLesson[e.lessonId] = (errorsByLesson[e.lessonId] || 0) + 1
  }
  const errorStats = Object.entries(errorsByLesson).sort((a, b) => b[1] - a[1])

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white p-4 border-b sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <Link to="/" className="text-gray-600 text-2xl">←</Link>
          <h1 className="text-child font-bold text-gray-700">家长端</h1>
          <Link to="/settings" className="text-gray-500 text-sm">设置</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* 总览 */}
        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="text-sm font-bold text-gray-700 mb-3">📊 总览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="完成课数" value={`${completedLessons}/${totalLessons}`} />
            <Stat label="累计做题" value={String(totalQuestions)} />
            <Stat label="正确率" value={`${accuracy}%`} />
            <Stat label="连续打卡" value={streak ? `${streak.current}天` : '0天'} />
          </div>
        </section>

        {/* 需关注课（错题 > 3 道）*/}
        {errorStats.filter(([_, n]) => n >= 3).length > 0 && (
          <section className="bg-red-50 border-2 border-red-300 rounded-bubble p-5">
            <h2 className="text-sm font-bold text-red-700 mb-3">🚨 需要辅导的课</h2>
            <p className="text-sm text-red-600 mb-3">以下课错题较多，建议家长陪同复习：</p>
            <div className="space-y-2">
              {errorStats.filter(([_, n]) => n >= 3).map(([lid, n]) => (
                <div key={lid} className="flex items-center gap-3 bg-white rounded-soft p-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-700">{lid}</p>
                    <p className="text-xs text-red-500">错 {n} 道</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 13 课进度 */}
        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="text-sm font-bold text-gray-700 mb-3">📚 各课进度</h2>
          <div className="space-y-2">
            {lessons.map(l => (
              <div key={l.id} className="flex items-center gap-3">
                <span className="w-16 text-sm font-bold text-sea-900">{l.id}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pig-500"
                    style={{ width: `${(l.stars / 3) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-gray-600">
                  {'⭐'.repeat(l.stars)}{'☆'.repeat(3 - l.stars)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 错题分布 */}
        {errorStats.length > 0 && (
          <section className="bg-white rounded-bubble p-5 shadow-card">
            <h2 className="text-sm font-bold text-gray-700 mb-3">❗ 错题分布（按课）</h2>
            <div className="space-y-2">
              {errorStats.map(([lid, n]) => (
                <div key={lid} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-bold text-sea-900">{lid}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400"
                      style={{ width: `${Math.min(100, n * 10)}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-red-600">{n} 道</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 勋章 */}
        <section className="bg-white rounded-bubble p-5 shadow-card">
          <h2 className="text-sm font-bold text-gray-700 mb-3">🏅 勋章（{badges.length}/{BADGES.length}）</h2>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(b => {
              const earned = badges.some(x => x.code === b.code)
              return (
                <div key={b.code} className={`text-center ${earned ? '' : 'opacity-30'}`}>
                  <div className="text-4xl">{b.emoji}</div>
                  <p className="text-xs text-gray-700 mt-1">{b.name}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* 最近会话 */}
        {sessions.length > 0 && (
          <section className="bg-white rounded-bubble p-5 shadow-card">
            <h2 className="text-sm font-bold text-gray-700 mb-3">🕐 最近学习（最多 20 次）</h2>
            <div className="space-y-1 text-sm">
              {sessions.slice(0, 10).map(s => (
                <div key={s.id} className="flex justify-between text-gray-600">
                  <span>{new Date(s.startedAt).toLocaleString('zh-CN')}</span>
                  <span>{s.lessonId} · {s.itemsCorrect}/{s.itemsAnswered}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-orange-50 rounded-soft p-3 text-center">
      <p className="text-2xl font-bold text-sea-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
