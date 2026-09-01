// 课程地图：按单元分组展示当前年级全部课程
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { BADGES } from '@/utils/badges'
import { activeLessons, UNITS_BY_GRADE, GRADE_LABEL, ACTIVE_GRADE } from '@/data'
import type { Lesson } from '@/data/types'

export default function LessonMapPage() {
  const lessons = activeLessons()
  const units = UNITS_BY_GRADE[ACTIVE_GRADE]
  const recs = useLiveQuery(() => db.lessons.toArray(), []) || []
  const badgeCount = useLiveQuery(() => db.badges.count(), []) || 0
  const errorCount = useLiveQuery(() => db.errorItems.count(), []) || 0

  const recOf = (id: string) => recs.find(r => r.id === id)
  const isPinyinGrade = lessons.some(l => l.kind === 'pinyin')

  function LessonCard({ l }: { l: Lesson }) {
    const rec = recOf(l.id)
    const stars = rec?.stars ?? 0
    const locked = rec ? rec.unlocked === 0 : true
    return (
      <Link
        to={locked ? '#' : `/lesson/${l.id}`}
        onClick={e => { if (locked) e.preventDefault() }}
        className={`rounded-bubble flex flex-col items-center justify-center p-2 aspect-square border-2 active:scale-95 ${
          locked ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-pig-200'
        }`}
      >
        <span className="text-2xl mb-1">{locked ? '🔒' : stars > 0 ? '⭐'.repeat(Math.min(stars, 3)) : '🔓'}</span>
        <span className="text-xs font-bold text-sea-900 text-center leading-tight">{l.code}</span>
        <span className="text-[10px] text-pig-500 text-center leading-tight">{l.name}</span>
      </Link>
    )
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="bg-white p-4 border-b border-pig-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-pig-700 text-2xl">←</Link>
          <h1 className="text-child font-bold text-sea-900">{GRADE_LABEL} · 课程地图</h1>
          <Link to="/teacher" className="text-xs text-pig-500 font-bold px-2 py-1 rounded-full border border-pig-200">老师</Link>
        </div>
      </header>

      {/* 错题入口 */}
      {errorCount > 0 && (
        <div className="p-4 max-w-2xl mx-auto">
          <Link
            to="/errorbook"
            className="block bg-white rounded-bubble p-4 border-2 border-pig-200 flex items-center gap-3"
          >
            <span className="text-3xl">📒</span>
            <div className="flex-1">
              <p className="text-child font-bold text-sea-900">错题本</p>
              <p className="text-xs text-pig-500">{errorCount} 道错题待复习</p>
            </div>
            <span className="text-pig-500">›</span>
          </Link>
        </div>
      )}

      {/* 按单元分组 */}
      {units.map(u => {
        const items = lessons.filter(l => l.unit === u.no)
        if (items.length === 0) return null
        return (
          <div key={u.no} className="p-4 max-w-2xl mx-auto">
            <h2 className="text-sm text-pig-700 mb-3 font-bold">{u.label}</h2>
            <div className="grid grid-cols-3 gap-3">
              {items.map(l => <LessonCard key={l.id} l={l} />)}
            </div>
          </div>
        )
      })}

      {/* 复习关（拼音年级专属） */}
      {isPinyinGrade && (
        <div className="p-4 max-w-2xl mx-auto">
          <h2 className="text-sm text-pig-700 mb-3 font-bold">复习闯关</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'R1', name: '单韵母+声母', range: 'L01-L05' },
              { id: 'R2', name: '声母+整体认读', range: 'L02-L08' },
              { id: 'R3', name: '复韵母+前鼻音', range: 'L09-L12' },
              { id: 'R4', name: '总动员', range: 'L01-L13' },
            ].map(r => (
              <Link
                key={r.id}
                to={`/review?level=${r.id}`}
                className="bg-white rounded-bubble p-4 border-2 border-sun-300 active:scale-95"
              >
                <div className="text-3xl mb-1">🎪</div>
                <p className="text-child font-bold text-sun-700">{r.id}</p>
                <p className="text-xs text-pig-500">{r.name}</p>
                <p className="text-xs text-slate-400">{r.range}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 勋章墙 */}
      <div className="p-4 max-w-2xl mx-auto pb-10">
        <h2 className="text-sm text-pig-700 mb-3 font-bold">我的勋章</h2>
        <div className="bg-white rounded-bubble p-4">
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(b => (
              <div key={b.code} className="text-center">
                <div className={`text-4xl ${badgeCount > 0 ? '' : 'grayscale opacity-30'}`}>{b.emoji}</div>
                <p className="text-xs text-sea-900 mt-1">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
