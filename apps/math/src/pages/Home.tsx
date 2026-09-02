// 数学首页：年级切换 + 题卡 + 今日进度
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { topicsOf } from '@/data/topics'
import { UNITS } from '@/data/lessons'
import { ACTIVE_GRADE, GRADE_LABEL } from '@/data/grade'
import { BuildBadge } from '@/components/BuildBadge'

export default function Home() {
  const topics = topicsOf(ACTIVE_GRADE)
  const units = UNITS[ACTIVE_GRADE]
  const todayAttempts = useLiveQuery(
    () => db.attempts.where('ts').above(startOfToday()).toArray(),
    [],
  )
  const errorCount = useLiveQuery(() => db.errors.count(), [])

  const done = todayAttempts?.length ?? 0
  const correct = todayAttempts?.filter(a => a.correct === 1).length ?? 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-grass-50 to-cream-100 p-6">
      <div className="flex justify-end -mt-2 mb-2">
        <a href="/" className="inline-flex items-center gap-1 text-xs font-bold text-pig-500 bg-white/70 border border-pig-200 px-3 py-1.5 rounded-full active:scale-95">
          🏠 回首页
        </a>
      </div>

      <header className="text-center mt-4 mb-4">
        <h1 className="text-child-xl font-bold text-pig-700 mb-2">小小数学家</h1>
        <p className="text-child text-ink-500">{GRADE_LABEL} · 口算闯关 · 一起出发吧</p>
      </header>

      {/* 年级切换：?g= 整页刷新，grade.ts 持久化 */}
      <div className="flex justify-center gap-3 mb-6">
        {(['1', '2'] as const).map(g => (
          <a
            key={g}
            href={`?g=${g}`}
            className={`px-6 py-2 rounded-full text-child font-bold border-2 active:scale-95 transition ${
              ACTIVE_GRADE === g
                ? 'bg-pig-500 text-white border-pig-500 shadow-bubble'
                : 'bg-white text-pig-500 border-pig-200'
            }`}
          >
            {g === '1' ? '一年级' : '二年级'}
          </a>
        ))}
      </div>

      {/* 今日进度 */}
      <div className="paper-card p-4 mb-6 text-center">
        <p className="text-child text-ink-700">
          🌟 今天已练 <b className="text-pig-600">{done}</b> 题
          {done > 0 && <> · 答对 <b className="text-grass-600">{correct}</b> 题（{Math.round((correct / done) * 100)}%）</>}
        </p>
      </div>

      {/* 口算题卡 */}
      <p className="text-child font-bold text-ink-700 max-w-md mx-auto mb-3">⚡ 口算闯关</p>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {topics.map(t => (
          <Link
            key={t.id}
            to={`/practice/${t.id}`}
            className="paper-card p-5 flex items-center gap-4 active:scale-95 transition"
          >
            <span className="text-5xl">{t.emoji}</span>
            <span className="flex-1">
              <span className="block text-child-lg font-bold text-ink-900">{t.name}</span>
              <span className="block text-child text-ink-500">{t.desc}</span>
            </span>
            <span className="text-child font-bold text-pig-500">开始 →</span>
          </Link>
        ))}
      </div>

      {/* 课本同步 */}
      <p className="text-child font-bold text-ink-700 max-w-md mx-auto mt-8 mb-3">📚 课本同步</p>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {units.map(u => (
          <Link
            key={u.id}
            to={`/units/${u.id}`}
            className="paper-card p-5 flex items-center gap-4 active:scale-95 transition"
            style={{ borderColor: '#B7DDFD' }}
          >
            <span className="text-5xl">📘</span>
            <span className="flex-1">
              <span className="block text-child-lg font-bold text-ink-900">{u.name}</span>
              <span className="block text-child text-ink-500">{u.book} 课本 · {u.lessons.length} 课</span>
            </span>
            <span className="text-child font-bold text-sky-500">上课 →</span>
          </Link>
        ))}
      </div>

      {errorCount != null && errorCount > 0 && (
        <div className="text-center mt-6">
          <Link to="/errors" className="inline-block text-child font-bold text-chili-600 bg-chili-50 border-2 border-chili-500/30 px-5 py-2 rounded-full active:scale-95">
            📕 错题本 · {errorCount} 题待重练
          </Link>
        </div>
      )}

      <footer className="text-center mt-8 text-sm text-ink-500/40">
        小小数学家 · v0.1
      </footer>
      <BuildBadge className="mt-2 pb-4" />
    </main>
  )
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
