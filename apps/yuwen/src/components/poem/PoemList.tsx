// 古诗列表：按年级筛选
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { POEMS } from '@/data/poems'
import { Icon } from '@/components/icons/Icon'

type Grade = 1 | 2 | 3 | 'all'

export default function PoemList() {
  const navigate = useNavigate()
  const [grade, setGrade] = useState<Grade>('all')
  const list = grade === 'all' ? POEMS : POEMS.filter(p => p.grade === grade)

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 p-4 flex flex-col">
      {/* 顶部 */}
      <header className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="bg-white p-2 rounded-bubble shadow text-pig-700 active:scale-95"
          aria-label="返回首页"
        >
          <Icon name="arrow-left" className="w-6 h-6" />
        </button>
        <h1 className="text-child-lg font-bold text-pig-700">📜 古诗</h1>
        <div className="w-10" />
      </header>

      <p className="text-center text-child-sm text-pig-400 mb-4">带拼音 · 点字听音 · 一边读一边背</p>

      {/* 年级筛选 */}
      <div className="flex gap-2 mb-4 justify-center">
        {(['all', 1, 2, 3] as Grade[]).map(g => (
          <button
            key={g}
            onClick={() => setGrade(g)}
            className={`px-4 py-2 rounded-full text-child-sm font-bold transition-colors ${grade === g ? 'bg-pig-500 text-white' : 'bg-white text-pig-700 border-2 border-pig-200'}`}
          >
            {g === 'all' ? '全部' : `${g} 年级`}
          </button>
        ))}
      </div>

      {/* 古诗列表 */}
      <div className="flex-1 grid grid-cols-1 gap-3 max-w-2xl mx-auto w-full">
        {list.map(p => (
          <Link
            key={p.id}
            to={`/poem/${p.id}`}
            className="bg-white p-4 rounded-bubble shadow border-2 border-pig-100 active:scale-95 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-pig-100 rounded-bubble flex items-center justify-center text-pig-500 text-2xl flex-shrink-0">
              📜
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-child font-bold text-ink-900">{p.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${p.grade === 1 ? 'bg-sun-100 text-sun-700' : p.grade === 2 ? 'bg-sea-100 text-sea-700' : 'bg-pig-100 text-pig-700'}`}>
                  {p.grade} 年级
                </span>
              </div>
              <p className="text-sm text-pig-400 mt-0.5">
                {p.dynasty} · {p.author} · {p.theme}
              </p>
            </div>
            <Icon name="chevron-right" className="w-5 h-5 text-pig-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </main>
  )
}
