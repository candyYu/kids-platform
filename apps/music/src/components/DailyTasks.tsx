import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { loadPianoStats } from '@/data/piano-stats'
import { loadViolinStats } from '@/data/violin-stats'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function useTodayPianoPracticed(): boolean {
  const [practiced, setPracticed] = useState(false)
  useEffect(() => {
    const check = () => {
      const stats = loadPianoStats()
      setPracticed(stats.practiceDates.includes(todayStr()))
    }
    check()
    // 从钢琴页返回时刷新
    window.addEventListener('focus', check)
    window.addEventListener('visibilitychange', check)
    return () => {
      window.removeEventListener('focus', check)
      window.removeEventListener('visibilitychange', check)
    }
  }, [])
  return practiced
}

function useTodayViolinPracticed(): boolean {
  const [practiced, setPracticed] = useState(false)
  useEffect(() => {
    const check = () => {
      const stats = loadViolinStats()
      setPracticed(stats.todayDate === todayStr() && stats.todaySeconds > 0)
    }
    check()
    window.addEventListener('focus', check)
    window.addEventListener('visibilitychange', check)
    return () => {
      window.removeEventListener('focus', check)
      window.removeEventListener('visibilitychange', check)
    }
  }, [])
  return practiced
}

interface Task {
  key: string
  emoji: string
  label: string
  done: boolean
  to: string
  bg: string
}

export default function DailyTasks() {
  const { practiceDates, earProgress, loaded } = useStore()
  const pianoToday = useTodayPianoPracticed()
  const violinToday = useTodayViolinPracticed()

  // 今天有没有完成任意一节课（practiceDates 由 recordPractice 在课程完成时写入）
  const lessonToday = practiceDates.includes(todayStr())
  // 今天有没有做耳训（lastDate 用的是 toDateString 格式，这里对齐）
  const earToday = earProgress['E1']?.lastDate === new Date().toDateString()

  const tasks: Task[] = [
    { key: 'piano', emoji: '🎹', label: '弹一首钢琴曲', done: pianoToday, to: '/piano', bg: 'pink' },
    { key: 'violin', emoji: '🎻', label: '练小提琴', done: violinToday, to: '/violin', bg: 'amber' },
    { key: 'ear', emoji: '👂', label: '听一听小耳朵', done: earToday, to: '/ear-training', bg: 'blue' },
    { key: 'lesson', emoji: '📚', label: '上一节小课', done: lessonToday, to: '/', bg: 'orange' },
  ]

  const doneCount = tasks.filter(t => t.done).length
  const allDone = doneCount === tasks.length

  if (!loaded) return null

  const bgMap: Record<string, { done: string; todo: string }> = {
    pink: { done: 'bg-green-50 border-green-200', todo: 'bg-pink-50 border-pink-200' },
    amber: { done: 'bg-green-50 border-green-200', todo: 'bg-amber-50 border-amber-200' },
    blue: { done: 'bg-green-50 border-green-200', todo: 'bg-blue-50 border-blue-200' },
    orange: { done: 'bg-green-50 border-green-200', todo: 'bg-orange-50 border-orange-200' },
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-700">
          🌟 今日小任务
        </h2>
        <span className="text-sm font-bold text-purple-500">
          {allDone ? '全部完成啦 🎉' : `${doneCount}/${tasks.length}`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {tasks.map(t => {
          const cls = t.done ? bgMap[t.bg].done : bgMap[t.bg].todo
          const inner = (
            <div className={`p-3 rounded-xl border-2 text-center transition-all active:scale-95 ${cls}`}>
              <div className="text-2xl mb-1">{t.done ? '✅' : t.emoji}</div>
              <div className={`text-xs font-bold leading-tight ${t.done ? 'text-green-600 line-through' : 'text-gray-600'}`}>
                {t.label}
              </div>
            </div>
          )
          return t.key === 'lesson' ? (
            // 课程任务：点了平滑滚动到下面的课程地图
            <a key={t.key} href="#" onClick={(e) => {
              e.preventDefault()
              document.getElementById('lessons')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}>{inner}</a>
          ) : (
            <Link key={t.key} to={t.to}>{inner}</Link>
          )
        })}
      </div>

      {allDone && (
        <div className="mt-3 text-center text-sm text-yellow-600 font-bold bg-yellow-50 rounded-xl py-2">
          ⭐ 今天的小任务都完成啦，真棒！明天继续哦～
        </div>
      )}
    </div>
  )
}
