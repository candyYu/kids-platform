import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { reviewChallenges } from '@/data/lessons'
import { useStore } from '@/store'
import DictationQuiz from '@/components/DictationQuiz'

export default function Review() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const updateLessonProgress = useStore((s) => s.updateLessonProgress)
  const recordPractice = useStore((s) => s.recordPractice)
  const checkBadges = useStore((s) => s.checkBadges)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState({ correct: 0, total: 0 })
  const challenge = reviewChallenges.find((c) => c.challengeId === challengeId)

  if (!challenge) {
    return (
      <div className="text-center p-8">
        <p>未找到闯关内容</p>
        <Link to="/" className="btn-secondary mt-4 inline-block">返回首页</Link>
      </div>
    )
  }

  const handleComplete = async (correct: number, total: number, _results: boolean[]) => {
    const accuracy = correct / total
    const passed = accuracy >= challenge.passThreshold
    setResult({ correct, total })
    setFinished(true)
    await updateLessonProgress({
      lessonId: challenge.challengeId,
      status: passed ? 'completed' : 'in-progress',
      dictationAccuracy: accuracy,
      completedAt: new Date().toISOString(),
    })
    recordPractice(challenge.challengeId, accuracy, 0)
    checkBadges({ reviewPerfect: accuracy === 1 })
  }

  if (finished) {
    const passed = result.correct / result.total >= challenge.passThreshold
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="card">
          <div className="text-6xl mb-4">{passed ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {passed ? '闯关成功！' : '再练一练'}
          </h2>
          {!passed && (
            <p className="text-orange-400 text-sm mb-4">没关系，多听几遍就会啦！再试一次吧！</p>
          )}
          <p className="text-lg text-gray-500 mb-6">
            答对 {result.correct} / {result.total} 题（正确率 {Math.round(result.correct / result.total * 100)}%）
          </p>
          <div className="space-y-3">
            <Link to="/" className="btn-primary inline-block">返回首页</Link>
            {!passed && (
              <button
                onClick={() => { setFinished(false); setResult({ correct: 0, total: 0 }) }}
                className="btn-secondary ml-2"
              >
                再试一次
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <Link to="/" className="text-sm text-gray-400">← 返回首页</Link>
      </div>
      <DictationQuiz
        questions={challenge.questions}
        onComplete={handleComplete}
        title={`${challenge.challengeId} · ${challenge.name}`}
      />
    </div>
  )
}
