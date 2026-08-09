// 课程地图：13 课卡片 + 复习关 + 总动员
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { BADGES } from '@/utils/badges'

export default function LessonMapPage() {
  const lessons = useLiveQuery(() => db.lessons.toArray(), []) || []
  const badgeCount = useLiveQuery(() => db.badges.count(), []) || 0
  const errorCount = useLiveQuery(() => db.errorItems.count(), []) || 0

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="bg-white p-4 border-b border-pig-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-pig-700 text-2xl">←</Link>
          <h1 className="text-child font-bold text-sea-900">课程地图</h1>
          <div className="text-sm text-sun-700 font-bold">🏅 {badgeCount}</div>
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

      {/* 13 课卡片 */}
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-sm text-pig-700 mb-3 font-bold">13 课</h2>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 13 }).map((_, i) => {
            const id = `L${String(i + 1).padStart(2, '0')}`
            const rec = lessons.find(l => l.id === id)
            const stars = rec?.stars ?? 0
            return (
              <Link
                key={id}
                to={`/lesson/${id}`}
                className="aspect-square rounded-bubble flex flex-col items-center justify-center p-2 bg-white shadow border-2 border-pig-200 active:scale-95"
              >
                <span className="text-3xl mb-1">{stars > 0 ? '⭐'.repeat(Math.min(stars, 3)) : '🔓'}</span>
                <span className="text-sm font-bold text-sea-900">第{i + 1}课</span>
                <span className="text-xs text-pig-500 text-center leading-tight">
                  {getShortName(id)}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 复习关 */}
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

      {/* 勋章墙 */}
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="text-sm text-pig-700 mb-3 font-bold">我的勋章</h2>
        <div className="bg-white rounded-bubble p-4">
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(b => (
              <div key={b.code} className="text-center">
                <div className={`text-4xl ${badgeEarned(badgeCount) ? '' : 'grayscale opacity-30'}`}>{b.emoji}</div>
                <p className="text-xs text-sea-900 mt-1">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function getShortName(id: string): string {
  const map: Record<string, string> = {
    L01: 'a o e', L02: 'i u ü y w', L03: 'b p m f', L04: 'd t n l',
    L05: 'g k h', L06: 'j q x', L07: 'z c s', L08: 'zh ch sh r',
    L09: 'ai ei ui', L10: 'ao ou iu', L11: 'ie üe er', L12: 'an en in un ün',
    L13: 'ang eng ing ong',
  }
  return map[id] || ''
}

function badgeEarned(_count: number) { return true }  // 简化：UI 总是亮的
