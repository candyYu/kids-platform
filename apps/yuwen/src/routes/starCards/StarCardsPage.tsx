// 拼音摘星卡列表：14 张卡，按课次排。显示卡面满☆与本机自评进度。
import { Link } from 'react-router-dom'
import { starCards, flatReadableItems } from '@/data/starCards'
import { useProgress, getCard, markCounts, type CardRating } from './progress'

const RATING_EMOJI: Record<NonNullable<CardRating>, string> = {
  proficient: '😄',
  familiar: '🙂',
  practice: '💪',
}

export default function StarCardsPage() {
  const progressMap = useProgress()

  return (
    <main className="min-h-screen bg-gradient-to-b from-pig-50 via-orange-50 to-sun-50 p-4">
      <header className="max-w-xl mx-auto flex items-center gap-2 mb-4">
        <Link to="/" className="text-sm font-bold text-pig-500 bg-white border border-pig-200 rounded-full px-3 py-1.5 active:scale-95">
          ← 回首页
        </Link>
        <h1 className="flex-1 text-center text-xl font-bold text-pig-700">🎴 拼音摘星卡</h1>
        <span className="w-[72px]" />
      </header>

      <div className="max-w-xl mx-auto grid grid-cols-2 gap-3">
        {starCards.map(card => {
          const prog = progressMap[card.lesson] || getCard(card.lesson)
          const counts = markCounts(prog)
          const total = flatReadableItems(card).length
          return (
            <Link
              key={card.id}
              to={`/star-cards/${card.lesson}`}
              className="relative bg-white rounded-3xl shadow-card border-2 border-pig-200 p-4 active:scale-95 transition"
            >
              <p className="text-xs font-bold text-pig-400">第 {card.lesson} 课</p>
              <p className="text-lg font-bold text-ink-700 mt-0.5 break-words">{card.title}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-bold text-sun-700">
                  {counts.star > 0 ? `⭐ ${counts.star}` : '满☆ '}{card.totalStars ?? total}
                </span>
                {counts.wrong > 0 && <span className="text-chili-500 font-bold">🔴 {counts.wrong}</span>}
                {prog.rating && <span className="text-base">{RATING_EMOJI[prog.rating]}</span>}
              </div>
            </Link>
          )
        })}
      </div>

      <p className="max-w-xl mx-auto text-center text-[11px] text-ink-400 mt-6">
        点卡片进入，先听妈妈读整张卡，再自己读给妈妈听
      </p>
    </main>
  )
}
