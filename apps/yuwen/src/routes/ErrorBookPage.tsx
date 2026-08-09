// 错题本
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer'
import { getQuestions } from '@/data/questionBank'
import { useState } from 'react'
import { nextReviewDate, nextPhase } from '@/utils/schedule'
import { checkErrorBookEmpty } from '@/utils/badges'

export default function ErrorBookPage() {
  const errors = useLiveQuery(() => db.errorItems.orderBy('nextReviewAt').toArray(), []) || []
  // 已到 due 时间排最前
  const sorted = [...errors].sort((a, b) => {
    const aDue = a.nextReviewAt - Date.now()
    const bDue = b.nextReviewAt - Date.now()
    if ((aDue <= 0) !== (bDue <= 0)) return aDue <= 0 ? -1 : 1
    return aDue - bDue
  })
  const [activeId, setActiveId] = useState<number | null>(null)

  if (errors.length === 0) {
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <header className="flex items-center mb-6">
          <Link to="/" className="text-pig-700 text-2xl mr-3">←</Link>
          <h1 className="text-child-lg font-bold text-pig-700">错题本</h1>
        </header>
        <div className="bg-white rounded-bubble p-8 text-center text-pig-700/60 mt-12">
          <p className="text-7xl mb-4">✨</p>
          <p className="text-child font-bold text-sea-900 mb-2">没有错题！</p>
          <p className="text-sm">做错的题目会出现在这里，按艾宾浩斯曲线复习</p>
        </div>
      </main>
    )
  }

  const activeItem = activeId !== null ? errors.find(e => e.id === activeId) : null
  if (activeItem) {
    const item = activeItem
    const question = findOriginalQuestion(item.lessonId, item.questionId)
    if (!question) {
      return (
        <main className="p-6">
          <p>题目已不可用</p>
          <button onClick={() => setActiveId(null)}>返回</button>
        </main>
      )
    }
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <header className="flex items-center mb-4">
          <button onClick={() => setActiveId(null)} className="text-pig-700 text-2xl mr-3">←</button>
          <h1 className="text-child font-bold text-sea-900">错题重做</h1>
        </header>
        <div className="bg-white rounded-bubble p-6">
          <QuestionRenderer
            key={question.id}
            question={question}
            onAnswer={async (correct) => {
              if (correct) {
                // 答对：doneCount+1，3 次后移除；否则推 nextReviewAt
                const newDone = item.doneCount + 1
                const phase = Math.min(newDone, 3) as 0 | 1 | 2 | 3
                if (newDone >= 3) {
                  await db.errorItems.delete(item.id!)
                } else {
                  await db.errorItems.update(item.id!, {
                    doneCount: newDone,
                    nextReviewAt: nextReviewDate(nextPhase(phase)),
                  })
                }
                await checkErrorBookEmpty()
                setActiveId(null)
              } else {
                // 又错了：重置
                await db.errorItems.update(item.id!, {
                  count: item.count + 1,
                  lastWrongAt: Date.now(),
                  nextReviewAt: nextReviewDate(0),
                })
                setActiveId(null)
              }
            }}
          />
        </div>
      </main>
    )
  }

  // 错题列表
  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <header className="flex items-center mb-6">
        <Link to="/" className="text-pig-700 text-2xl mr-3">←</Link>
        <h1 className="text-child-lg font-bold text-pig-700">错题本</h1>
        <span className="ml-3 text-sm text-pig-500">{errors.length} 道</span>
      </header>
      <div className="space-y-3 max-w-2xl mx-auto">
        {sorted.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveId(item.id!)}
            className="w-full bg-white rounded-bubble p-4 text-left border-2 border-pig-200 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📌</span>
              <div className="flex-1">
                <p className="text-child font-bold text-sea-900">{item.lessonId} · {item.type}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{item.prompt}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-pig-500">错{item.count}次</span>
                  <span className="text-xs text-sun-700">重做{item.doneCount}次</span>
                </div>
              </div>
              <span className="text-pig-500 text-2xl">›</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}

function findOriginalQuestion(lessonId: string, questionId: string) {
  return getQuestions(lessonId).find(q => q.id === questionId)
}
