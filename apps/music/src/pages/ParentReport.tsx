import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { S2_LESSONS } from '@/data/s2-lessons'
import { lessonL05 } from '@/data/lessons'
import { BADGES } from '@/types'
import BadgeDisplay from '@/components/BadgeDisplay'

export default function ParentReport() {
  const { lessonProgress, badges, streak, practiceDates } = useStore()
  const allLessons = [lessonL05, ...S2_LESSONS].sort((a, b) => a.lessonId.localeCompare(b.lessonId))

  const completed = allLessons.filter(l => lessonProgress[l.lessonId]?.status === 'completed')
  const inProgress = allLessons.filter(l => lessonProgress[l.lessonId]?.status === 'in-progress')
  const totalDuration = completed.reduce((s, l) => s + (lessonProgress[l.lessonId]?.duration || 0), 0)
  const avgAccuracy = completed.length > 0
    ? completed.reduce((s, l) => s + (lessonProgress[l.lessonId]?.dictationAccuracy || 0), 0) / completed.length
    : 0

  // 薄弱环节：正确率 < 80% 的已完成课程
  const weakLessons = completed
    .filter(l => (lessonProgress[l.lessonId]?.dictationAccuracy ?? 1) < 0.8)
    .sort((a, b) => (lessonProgress[a.lessonId]?.dictationAccuracy ?? 1) - (lessonProgress[b.lessonId]?.dictationAccuracy ?? 1))

  // 近7天练习天数
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return d.toISOString().slice(0, 10)
  })
  const practiceThisWeek = last7Days.filter(d => practiceDates.includes(d)).length

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="text-sm text-gray-400">← 首页</Link>
        <span className="text-sm text-gray-400">家长报告</span>
      </div>

      {/* 概览 */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4">📊 学习概览</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-purple-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-purple-500">{completed.length}</div>
            <div className="text-xs text-gray-400">已完成课时</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-blue-500">{Math.round(avgAccuracy * 100)}%</div>
            <div className="text-xs text-gray-400">平均正确率</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="text-2xl font-bold text-green-500">{Math.round(totalDuration / 60)}分</div>
            <div className="text-xs text-gray-400">总练习时长</div>
          </div>
        </div>
        <div className="mt-3 flex gap-3 text-center">
          <div className="flex-1 bg-orange-50 rounded-xl p-3">
            <div className="text-xl font-bold text-orange-500">{streak} 🔥</div>
            <div className="text-xs text-gray-400">连续天数</div>
          </div>
          <div className="flex-1 bg-yellow-50 rounded-xl p-3">
            <div className="text-xl font-bold text-yellow-500">{practiceThisWeek}/7</div>
            <div className="text-xs text-gray-400">本周练习</div>
          </div>
          <div className="flex-1 bg-pink-50 rounded-xl p-3">
            <div className="text-xl font-bold text-pink-500">{badges.length}/{BADGES.length}</div>
            <div className="text-xs text-gray-400">徽章</div>
          </div>
        </div>
      </div>

      {/* 本周打卡 */}
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-3">📅 本周打卡</h2>
        <div className="flex justify-around">
          {last7Days.map((d) => {
            const practiced = practiceDates.includes(d)
            const dayName = ['日','一','二','三','四','五','六'][new Date(d).getDay()]
            const isToday = d === new Date().toISOString().slice(0, 10)
            return (
              <div key={d} className="text-center">
                <div className={`text-xs mb-1 ${isToday ? 'text-purple-500 font-bold' : 'text-gray-400'}`}>{dayName}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  practiced ? 'bg-green-100 text-green-500' : 'bg-gray-50 text-gray-300'
                }`}>
                  {practiced ? '✅' : '○'}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 徽章 */}
      <div className="mb-6">
        <BadgeDisplay badges={badges} />
      </div>

      {/* 薄弱环节 */}
      {weakLessons.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">⚠️ 建议复习</h2>
          <p className="text-xs text-gray-400 mb-3">以下课程正确率较低，建议再练一次</p>
          <div className="space-y-2">
            {weakLessons.map(l => {
              const acc = lessonProgress[l.lessonId]?.dictationAccuracy ?? 0
              return (
                <Link key={l.lessonId} to={`/lesson/${l.lessonId}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200 active:scale-95 transition-all">
                  <div>
                    <span className="text-sm font-bold text-gray-700">{l.lessonId}</span>
                    <span className="ml-2 text-sm text-gray-600">{l.lessonName}</span>
                  </div>
                  <span className="text-sm text-orange-500">{Math.round(acc * 100)}%</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 进行中 */}
      {inProgress.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-700 mb-3">📝 进行中</h2>
          <div className="space-y-2">
            {inProgress.map(l => (
              <Link key={l.lessonId} to={`/lesson/${l.lessonId}`}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 active:scale-95 transition-all">
                <div>
                  <span className="text-sm font-bold text-gray-700">{l.lessonId}</span>
                  <span className="ml-2 text-sm text-gray-600">{l.lessonName}</span>
                </div>
                <span className="text-sm text-blue-400">继续 →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link to="/" className="btn-primary w-full text-center block">返回首页</Link>
    </div>
  )
}
