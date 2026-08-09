// 阶段4 拼读：从题库中抽 6-8 道非听写题，混出
import { useState } from 'react'
import type { Lesson } from '@/data/lessons'
import { getQuestions } from '@/data/questionBank'
import { shuffle } from '@/utils/pinyin'
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer'

interface Props {
  lesson: Lesson
  onComplete: (correct: number, total: number) => void
}

export function QuizStage({ lesson, onComplete }: Props) {
  const allQ = getQuestions(lesson.id).filter(q => q.type !== 'imageToSyllable' && q.type !== 'trace')
  const [questions] = useState(() => shuffle(allQ).slice(0, Math.min(10, allQ.length)))
  const [idx, setIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-child text-pig-700">本课暂无拼读题</p>
        <button onClick={() => onComplete(0, 0)} className="mt-4 px-6 py-3 bg-pig-500 text-white rounded-bubble">下一步</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-child-lg font-bold text-sea-900 mb-3">拼读完成！</h2>
        <p className="text-child text-pig-700 mb-8">答对 {correctCount} / {questions.length}</p>
        <button onClick={() => onComplete(correctCount, questions.length)} className="px-10 py-5 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble">闯关去 →</button>
      </div>
    )
  }

  const q = questions[idx]

  return (
    <div>
      <div className="text-center text-sm text-pig-500 mb-4">拼读 {idx + 1} / {questions.length}</div>
      <QuestionRenderer
        key={q.id}
        question={q}
        onAnswer={(correct) => {
          if (correct) setCorrectCount(c => c + 1)
          if (idx + 1 >= questions.length) {
            setDone(true)
          } else {
            setIdx(i => i + 1)
          }
        }}
      />
    </div>
  )
}
