// 复习闯关：R1-R4
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { QUESTION_BANK } from '@/data/questionBank'
import { shuffle } from '@/utils/pinyin'
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer'
import { db } from '@/db/schema'

const REVIEW_CONFIG: Record<string, { name: string; lessons: string[]; count: number }> = {
  R1: { name: '单韵母+声母', lessons: ['L01', 'L02', 'L03', 'L04', 'L05'], count: 10 },
  R2: { name: '声母+整体认读', lessons: ['L02', 'L06', 'L07', 'L08'], count: 10 },
  R3: { name: '复韵母+前鼻音', lessons: ['L09', 'L10', 'L11', 'L12'], count: 10 },
  R4: { name: '总动员', lessons: ['L01','L02','L03','L04','L05','L06','L07','L08','L09','L10','L11','L12','L13'], count: 15 },
}

export default function ReviewPage() {
  const [params] = useSearchParams()
  const level = params.get('level') || 'R1'
  const config = REVIEW_CONFIG[level] || REVIEW_CONFIG.R1

  const questions = useMemo(() => {
    const pool = config.lessons.flatMap(l => QUESTION_BANK[l as keyof typeof QUESTION_BANK] || [])
    return shuffle(pool).slice(0, config.count)
  }, [level, config])

  const [idx, setIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <main className="p-6">
        <p>本复习关暂无题目</p>
        <Link to="/map">返回地图</Link>
      </main>
    )
  }

  if (done) {
    const passed = correctCount >= questions.length * 0.8
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <div className="text-center py-12">
          <div className="text-9xl mb-4">{passed ? '🏆' : '💪'}</div>
          <h2 className={`text-child-lg font-bold mb-3 ${passed ? 'text-sun-700' : 'text-pig-700'}`}>
            {level} {passed ? '通关！' : '再练练'}
          </h2>
          <p className="text-child text-pig-700 mb-8">{correctCount} / {questions.length}</p>
          <Link to="/map" className="inline-block px-10 py-5 bg-pig-500 text-white text-child font-bold rounded-bubble">
            返回地图
          </Link>
        </div>
      </main>
    )
  }

  const q = questions[idx]

  return (
    <main className="min-h-screen bg-orange-50 p-6">
      <header className="flex items-center mb-4">
        <Link to="/map" className="text-pig-700 text-2xl mr-3">←</Link>
        <div>
          <h1 className="text-child font-bold text-sea-900">{level} · {config.name}</h1>
          <p className="text-sm text-pig-500">第 {idx + 1} / {questions.length} 题</p>
        </div>
      </header>
      <div className="bg-white rounded-bubble p-6">
        <QuestionRenderer
          key={q.id}
          question={q}
          onAnswer={(correct) => {
            if (correct) setCorrectCount(c => c + 1)
            if (idx + 1 >= questions.length) {
              setDone(true)
              // 记录
              void db.sessions.add({
                lessonId: level,
                startedAt: Date.now(),
                endedAt: Date.now(),
                itemsAnswered: questions.length,
                itemsCorrect: correctCount + (correct ? 1 : 0),
              })
            } else {
              setIdx(i => i + 1)
            }
          }}
        />
      </div>
    </main>
  )
}
