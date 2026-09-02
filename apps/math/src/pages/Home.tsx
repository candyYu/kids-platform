// 数学首页：年级切换 + 题卡 + 今日进度
// 题卡点卡身=普通 10 题，点 ⏱=1 分钟计时挑战；下学期内容默认折叠（保护动机）
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { topicsOf, type Topic } from '@/data/topics'
import { UNITS } from '@/data/lessons'
import { ACTIVE_GRADE, GRADE_LABEL } from '@/data/grade'
import { BuildBadge } from '@/components/BuildBadge'

export default function Home() {
  const navigate = useNavigate()
  const topics = topicsOf(ACTIVE_GRADE)
  const units = UNITS[ACTIVE_GRADE]
  const [showNextTerm, setShowNextTerm] = useState(false)
  const todayAttempts = useLiveQuery(
    () => db.attempts.where('ts').above(startOfToday()).toArray(),
    [],
  )
  const errorCount = useLiveQuery(
    async () => (await db.errors.count()) + (await db.lessonErrors.count()),
    [],
  )

  const done = todayAttempts?.length ?? 0
  const correct = todayAttempts?.filter(a => a.correct === 1).length ?? 0

  const curTopics = topics.filter(t => !t.nextTerm)
  const nextTopics = topics.filter(t => t.nextTerm)

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

      {/* 口算题卡（本学期） */}
      <p className="text-child font-bold text-ink-700 max-w-md mx-auto mb-3">⚡ 口算闯关</p>
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {curTopics.map(t => (
          <TopicCard key={t.id} topic={t} onOpen={() => navigate(`/practice/${t.id}`)} />
        ))}
      </div>

      {/* 下学期内容：默认折叠，家长可展开 */}
      {nextTopics.length > 0 && (
        <div className="max-w-md mx-auto mt-4">
          <button
            onClick={() => setShowNextTerm(v => !v)}
            className="w-full text-center text-child font-bold text-ink-500 bg-white/60 border-2 border-dashed border-pig-200 rounded-soft py-3 active:scale-95"
          >
            {showNextTerm ? '收起 ▲' : `🔒 下学期内容（${nextTopics.length} 张题卡）▼`}
          </button>
          {showNextTerm && (
            <div className="grid grid-cols-1 gap-4 mt-4 opacity-80">
              {nextTopics.map(t => (
                <TopicCard key={t.id} topic={t} onOpen={() => navigate(`/practice/${t.id}`)} />
              ))}
            </div>
          )}
        </div>
      )}

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

/** 口算题卡：点卡身进普通模式，点 ⏱ 进 1 分钟计时挑战 */
function TopicCard({ topic: t, onOpen }: { topic: Topic; onOpen: () => void }) {
  return (
    <div onClick={onOpen} className="paper-card p-5 flex items-center gap-4 active:scale-95 transition cursor-pointer">
      <span className="text-5xl">{t.emoji}</span>
      <span className="flex-1">
        <span className="block text-child-lg font-bold text-ink-900">{t.name}</span>
        <span className="block text-child text-ink-500">{t.desc}</span>
      </span>
      <Link
        to={`/practice/${t.id}?t=60`}
        onClick={e => e.stopPropagation()}
        aria-label={`${t.name} 1 分钟计时挑战`}
        className="shrink-0 px-3 py-2 rounded-full bg-sun-500 text-white text-sm font-bold active:scale-95"
      >
        ⏱ 1分钟
      </Link>
      <span className="text-child font-bold text-pig-500 shrink-0">开始 →</span>
    </div>
  )
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
