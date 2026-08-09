// 阶段5 闯关：混 10 道题，8/10 通过即解锁下一课
import { useState } from 'react'
import type { Lesson } from '@/data/lessons'
import { getQuestions } from '@/data/questionBank'
import { shuffle } from '@/utils/pinyin'
import { QuestionRenderer } from '@/components/quiz/QuestionRenderer'
import { db } from '@/db/schema'
import { getLesson } from '@/data/lessons'

interface Props {
  lesson: Lesson
  onComplete: (passed: boolean, correct: number, total: number) => void
}

const PASS_THRESHOLD = 0.8  // 80%

export function ChallengeStage({ lesson, onComplete }: Props) {
  const allQ = getQuestions(lesson.id)
  const [questions] = useState(() => shuffle(allQ).slice(0, Math.min(12, allQ.length)))
  const [idx, setIdx] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [passed, setPassed] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-child text-pig-700">本课暂无闯关题</p>
        <button onClick={() => onComplete(false, 0, 0)} className="mt-4 px-6 py-3 bg-pig-500 text-white rounded-bubble">完成</button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="text-9xl mb-4">{passed ? '🏆' : '💪'}</div>
        <h2 className={`text-child-lg font-bold mb-3 ${passed ? 'text-sun-700' : 'text-pig-700'}`}>
          {passed ? '闯关成功！' : '再练练吧'}
        </h2>
        <p className="text-child text-pig-700 mb-2">答对 {correctCount} / {questions.length}</p>
        <p className="text-sm text-slate-500 mb-8">通关要求：{Math.ceil(questions.length * PASS_THRESHOLD)}/{questions.length} 正确</p>
        <button
          onClick={() => onComplete(passed, correctCount, questions.length)}
          className="px-10 py-5 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble"
        >
          {passed ? '完成 →' : '再试一次'}
        </button>
      </div>
    )
  }

  const q = questions[idx]
  const finalCorrect = correctCount + (passed ? 0 : 0)  // placeholder

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        <span className="text-sm text-pig-500">闯关 {idx + 1} / {questions.length}</span>
        <span className="text-sm font-bold text-sun-700">⭐ {correctCount}</span>
      </div>
      <QuestionRenderer
        key={q.id}
        question={q}
        onAnswer={(correct) => {
          const newCount = correctCount + (correct ? 1 : 0)
          setCorrectCount(newCount)
          if (idx + 1 >= questions.length) {
            const ratio = newCount / questions.length
            const isPassed = ratio >= PASS_THRESHOLD
            setPassed(isPassed)
            setDone(true)
            // 持久化
            void (async () => {
              const total = questions.length
              await db.stages.add({
                lessonId: lesson.id,
                stage: 'challenge',
                score: newCount,
                total,
                completedAt: Date.now(),
              })
              const lessonRec = await db.lessons.get(lesson.id)
              if (lessonRec) {
                const stars = newCount === total ? 3 : newCount >= total * 0.9 ? 2 : 1
                if (isPassed) {
                  await db.lessons.update(lesson.id, {
                    bestScore: Math.max(lessonRec.bestScore, newCount),
                    stars: Math.max(lessonRec.stars, stars),
                    completedAt: Date.now(),
                  })
                  // 解锁下一课
                  if (lesson.unlocks.length > 0) {
                    for (const next of lesson.unlocks) {
                      await db.lessons.update(next, { unlocked: 1 })
                    }
                  }
                  // 检查勋章
                  const { checkBadges } = await import('@/utils/badges')
                  await checkBadges(lesson.id, isPassed)
                }
              }
            })()
          } else {
            setIdx(i => i + 1)
          }
        }}
      />
    </div>
  )
}
