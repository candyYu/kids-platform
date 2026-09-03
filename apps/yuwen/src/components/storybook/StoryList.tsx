// 绘本书架：公版故事列表（读过显示徽章）
import { Link } from 'react-router-dom'
import { STORYBOOKS, getReadBooks } from '@/data/storybooks'

export default function StoryList() {
  const read = getReadBooks()

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-5 pb-10">
      <header className="flex items-center gap-3 mb-5">
        <Link
          to="/"
          className="w-11 h-11 flex items-center justify-center text-2xl bg-white border-2 border-pig-200 rounded-full active:scale-95"
          aria-label="返回"
        >
          ←
        </Link>
        <div>
          <h1 className="text-child-lg font-bold text-pig-700">📚 绘本书架</h1>
          <p className="text-xs text-sea-900/60">和爸爸妈妈一起读</p>
        </div>
      </header>

      <div className="max-w-md mx-auto flex flex-col gap-4">
        {STORYBOOKS.map((b) => {
          const isRead = !!read[b.id]
          return (
            <Link
              key={b.id}
              to={`/storybook/${b.id}`}
              className="relative bg-white rounded-bubble shadow-card p-5 flex items-center gap-4 border-2 border-pig-200 active:scale-95"
            >
              <span className="text-5xl shrink-0">{b.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-child-lg font-bold text-sea-900">{b.title}</p>
                <p className="text-xs text-sea-900/50 mt-0.5">
                  {b.pages.length} 页 · 读完有问答 ✨
                </p>
              </div>
              {isRead && (
                <span className="shrink-0 bg-grass-100 text-grass-700 text-xs font-bold px-2.5 py-1 rounded-full border border-grass-300">
                  读过 ✓
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </main>
  )
}
