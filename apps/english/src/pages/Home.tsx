// 英语首页：两册分组单元列表 + 今日复习提醒（艾宾浩斯）+ 平台激励（星星/火焰）
// 结构决策：全部单元自由进入（同拼音课，家长按需选课，不顺序锁）
import { Link } from 'react-router-dom'
import { UNITS, BOOKS, type EnUnit } from '@/data/units'
import { BuildBadge } from '@/components/BuildBadge'
import { getStars, getStreak, dueCount } from '@kids/core'

function UnitCard({ unit }: { unit: EnUnit }) {
  const name = unit.title ? unit.title : unit.titleZh
  return (
    <Link
      to={`/unit/${unit.id}`}
      className="paper-card flex flex-col items-center justify-center gap-1 py-5 px-2 active:scale-95 transition shadow-card"
    >
      <span className="text-4xl leading-none">{unit.emoji}</span>
      <span className="text-xs font-bold text-sky-600 mt-1">{unit.label}</span>
      <span className="text-child font-bold text-ink-900 text-center leading-tight">{name}</span>
      <span className="text-[11px] text-ink-500">
        {unit.words.length > 0 ? `${unit.words.length} 词 · ` : ''}
        {unit.sentences.length} 句
      </span>
    </Link>
  )
}

export default function Home() {
  const groups = (['1a', '1b'] as const).map((book) => ({
    book,
    units: UNITS.filter((u) => u.book === book),
  }))
  const stars = getStars()
  const streak = getStreak()
  const reviewDue = dueCount('en')

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-cream-100 p-5 pb-10">
      <div className="flex justify-between items-center -mt-1 mb-1">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-pig-500 bg-white/70 border border-pig-200 px-3 py-1.5 rounded-full active:scale-95"
        >
          🏠 回首页
        </a>
        {/* 平台激励（与全平台共享）：星星 + 连续天数 */}
        <div className="flex gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-sun-700 bg-white/70 border border-sun-300 px-3 py-1.5 rounded-full">
            ⭐ {stars}
          </span>
          {streak.current > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-chili-600 bg-white/70 border border-chili-500/40 px-3 py-1.5 rounded-full">
              🔥 {streak.current} 天
            </span>
          )}
        </div>
      </div>

      <header className="text-center mt-3 mb-5">
        <h1 className="text-child-xl font-bold text-sky-700 mb-1">小小英语家</h1>
        <p className="text-child text-ink-500">人教版新起点 · 一年级 · 点读学英语</p>
      </header>

      {/* 今日复习提醒（艾宾浩斯：学过的词 1/2/4/7/15/30 天后到期） */}
      {reviewDue > 0 && (
        <Link
          to="/review"
          className="mb-5 block bg-gradient-to-r from-sun-300 to-sun-500 text-white p-5 rounded-bubble shadow-sky active:scale-95"
        >
          <div className="flex items-center gap-3">
            <span className="text-4xl">🧠</span>
            <div className="flex-1">
              <p className="text-child-lg font-bold">今日复习</p>
              <p className="text-sm opacity-90">
                {reviewDue} 个单词到时间啦，复习一下记得更牢！
              </p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </Link>
      )}

      {groups.map(({ book, units }) => (
        <section key={book} className="mb-6">
          <h2 className="flex items-center gap-2 text-child-lg font-bold text-ink-700 mb-3">
            <span className="text-2xl">{BOOKS[book].emoji}</span>
            {BOOKS[book].name}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {units.map((u) => (
              <UnitCard key={u.id} unit={u} />
            ))}
          </div>
        </section>
      ))}

      <BuildBadge className="mt-4" />
    </main>
  )
}
