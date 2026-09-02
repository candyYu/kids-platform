// 单元课程列表：课本同步 → 点进具体课程
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { unitById } from '@/data/lessons'
import { db, today } from '@/db/schema'

export default function UnitsPage() {
  const { unitId = '' } = useParams()
  const navigate = useNavigate()
  const unit = unitById(unitId)
  const daily = useLiveQuery(() => db.daily.toArray(), [])

  if (!unit) {
    return (
      <main className="min-h-screen p-6 text-center">
        <p className="text-child-lg mt-20">单元不存在</p>
        <button onClick={() => navigate('/')} className="btn-pig px-8 py-3 mt-6">回首页</button>
      </main>
    )
  }

  const starsOf = (lessonId: string) => {
    const rec = daily?.find(d => d.topic === lessonId && d.day === today())
    return rec?.bestStars ?? -1
  }

  return (
    <main className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/')} className="text-child text-pig-500 font-bold px-2">← 首页</button>
        <span className="text-xs font-bold text-white bg-grass-500 px-3 py-1 rounded-full">{unit.book} 课本</span>
      </div>
      <header className="text-center mb-6">
        <h1 className="text-child-xl font-bold text-pig-700">{unit.name}</h1>
        <p className="text-child text-ink-500 mt-1">跟着课本学，一课一练</p>
      </header>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {unit.lessons.map((l, i) => {
          const stars = starsOf(l.id)
          return (
            <Link key={l.id} to={`/lesson/${l.id}`} className="paper-card p-5 flex items-center gap-4 active:scale-95 transition">
              <span className="w-12 h-12 rounded-full bg-grass-500 text-white text-child-lg font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1">
                <span className="block text-child-lg font-bold text-ink-900">{l.title}</span>
                <span className="block text-child text-ink-500">{l.cards.length} 张卡片 · {stars >= 0 ? '⭐'.repeat(stars) : '还没学过'}</span>
              </span>
              <span className="text-child font-bold text-pig-500">开始 →</span>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
