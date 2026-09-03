// 亲子共读：绘本阅读器
// 交互流：翻页（自动朗读当前句，可点喇叭重听）→ 最后一页 → 读后问答（2 题）→ 道理 + 庆祝
// 奖励：读完 +5⭐（@kids/core，全平台共享）；读书记录存 localStorage
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { storyById, storyAudio, markRead, type StoryPage } from '@/data/storybooks'
import { playFile, stopAudio } from '@/audio/tts'
import { addStars, touchStreak } from '@kids/core'

// 场景图：emoji 大场景卡（主角超大 + 配角中号 + 渐变背景），与全平台风格统一
function SceneView({ page }: { page: StoryPage }) {
  const [main, ...rest] = page.scene
  return (
    <div
      className={`w-full max-w-md aspect-square rounded-bubble shadow-card border-4 border-white bg-gradient-to-br ${page.bg} flex items-center justify-center gap-3`}
    >
      <span className="text-9xl leading-none drop-shadow-md">{main}</span>
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((e, i) => (
            <span key={i} className="text-6xl leading-none drop-shadow-sm">{e}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StoryReader() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const book = storyById(id)

  const [page, setPage] = useState(0)
  const [mode, setMode] = useState<'read' | 'quiz' | 'done'>('read')
  const [quizIdx, setQuizIdx] = useState(0)
  const [wrongPick, setWrongPick] = useState(-1)
  const [starGain, setStarGain] = useState(0)

  // 翻页自动朗读当前句（亲子共读：家长可自己读，app 朗读是辅助）
  useEffect(() => {
    if (!book || mode !== 'read') return
    stopAudio()
    playFile(storyAudio(book.id, page + 1)).catch(() => {})
  }, [book, page, mode])

  useEffect(() => () => stopAudio(), [])

  if (!book) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-6 text-center">
        <div className="text-6xl mt-20 mb-4">😕</div>
        <p className="text-child text-sea-900 mb-6">没有找到这本绘本</p>
        <Link to="/storybook" className="px-8 py-3 rounded-full bg-pig-500 text-white text-child font-bold active:scale-95">
          回书架
        </Link>
      </main>
    )
  }

  const isLast = page === book.pages.length - 1

  // ---------- 问答模式 ----------
  if (mode === 'quiz') {
    const q = book.quiz[quizIdx]
    const pick = (i: number) => {
      if (i === q.answer) {
        if (quizIdx + 1 >= book.quiz.length) {
          // 全部答对：完成！
          const got = addStars(5)
          touchStreak()
          markRead(book.id)
          setStarGain(got)
          setMode('done')
        } else {
          setQuizIdx((n) => n + 1)
        }
      } else {
        setWrongPick(i)
        setTimeout(() => setWrongPick(-1), 450)
      }
    }
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-sun-50 p-5 pb-10">
        <header className="flex items-center gap-3 mb-6">
          <button
            onClick={() => nav('/storybook')}
            className="w-11 h-11 flex items-center justify-center text-2xl bg-white border-2 border-pig-200 rounded-full active:scale-95"
            aria-label="返回"
          >
            ←
          </button>
          <h1 className="text-child-lg font-bold text-pig-700">{book.emoji} {book.title}</h1>
        </header>

        <div className="max-w-md mx-auto">
          <p className="text-center text-child text-sea-900 font-bold mb-1">读完啦，考考你 👇</p>
          <p className="text-center text-xs text-sea-900/50 mb-6">第 {quizIdx + 1} / {book.quiz.length} 题</p>

          <div className="bg-white rounded-bubble shadow-card p-6 mb-6 border-2 border-pig-200">
            <p className="text-child-lg font-bold text-sea-900 text-center leading-relaxed">{q.q}</p>
          </div>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => (
              <button
                key={opt}
                onClick={() => pick(i)}
                className={`bg-white rounded-bubble shadow-card py-5 text-child font-bold text-sea-900 border-2 border-pig-200 active:scale-95 ${
                  wrongPick === i ? 'shake border-chili-500' : ''
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ---------- 完成模式 ----------
  if (mode === 'done') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sun-50 to-pig-50 p-6 text-center flex flex-col items-center justify-center">
        <div className="text-7xl mb-4 pop-in">🎉</div>
        <h1 className="text-child-xl font-bold text-pig-700 mb-3">{book.title} 读完啦！</h1>
        <div className="bg-white rounded-bubble shadow-card px-6 py-5 mb-4 max-w-sm border-2 border-sun-300">
          <p className="text-xs text-sea-900/50 font-bold mb-1">这个故事告诉我们</p>
          <p className="text-child text-sun-700 font-bold leading-relaxed">{book.moral}</p>
        </div>
        {starGain > 0 && (
          <p className="text-child-lg font-bold text-sun-600 mb-6">⭐ +{starGain}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => { setPage(0); setQuizIdx(0); setMode('read') }}
            className="px-6 py-3 rounded-full bg-white border-2 border-pig-300 text-pig-600 text-child font-bold active:scale-95"
          >
            再读一遍
          </button>
          <Link
            to="/storybook"
            className="px-6 py-3 rounded-full bg-pig-500 text-white text-child font-bold shadow-bubble active:scale-95"
          >
            回书架
          </Link>
        </div>
      </main>
    )
  }

  // ---------- 阅读模式 ----------
  const p = book.pages[page]
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-4 pb-8 flex flex-col">
      <header className="flex items-center gap-3 mb-2">
        <button
          onClick={() => nav('/storybook')}
          className="w-11 h-11 flex items-center justify-center text-2xl bg-white border-2 border-pig-200 rounded-full active:scale-95"
          aria-label="返回"
        >
          ←
        </button>
        <h1 className="text-child-lg font-bold text-pig-700">{book.emoji} {book.title}</h1>
        <span className="ml-auto text-xs font-bold text-sea-900/50 bg-white/70 px-3 py-1.5 rounded-full">
          亲子共读
        </span>
      </header>

      {/* 插图（emoji 场景卡） */}
      <div className="flex-1 flex items-center justify-center my-2">
        <SceneView page={p} />
      </div>

      {/* 文字 + 朗读 */}
      <button
        onClick={() => playFile(storyAudio(book.id, page + 1)).catch(() => {})}
        className="bg-white rounded-bubble shadow-card px-5 py-4 mb-3 border-2 border-pig-200 active:scale-95 flex items-center gap-3"
      >
        <span className="text-3xl shrink-0">🔊</span>
        <p className="text-child font-bold text-sea-900 text-left leading-relaxed flex-1">{p.text}</p>
      </button>

      {/* 翻页 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPage((n) => Math.max(0, n - 1))}
          disabled={page === 0}
          className="w-14 h-14 shrink-0 flex items-center justify-center text-2xl bg-white border-2 border-pig-200 rounded-full active:scale-95 disabled:opacity-30 font-bold text-pig-600"
          aria-label="上一页"
        >
          ←
        </button>
        <div className="flex-1 flex justify-center gap-1.5">
          {book.pages.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i === page ? 'bg-pig-500' : 'bg-pig-200'}`}
            />
          ))}
        </div>
        {isLast ? (
          <button
            onClick={() => setMode('quiz')}
            className="px-5 h-14 rounded-full bg-sun-500 text-white text-child font-bold shadow-sun active:scale-95 shrink-0"
          >
            读完了 ✨
          </button>
        ) : (
          <button
            onClick={() => setPage((n) => Math.min(book.pages.length - 1, n + 1))}
            className="w-14 h-14 shrink-0 flex items-center justify-center text-2xl bg-pig-500 text-white rounded-full active:scale-95 font-bold shadow-bubble"
            aria-label="下一页"
          >
            →
          </button>
        )}
      </div>
    </main>
  )
}
