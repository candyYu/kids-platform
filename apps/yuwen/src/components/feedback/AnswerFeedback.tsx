// 判对错反馈：星星飞入 / 鼓励动画
// 答对：黄色 + 星星 + "太棒了！"
// 答错：红色 + "再想想" + 大字正确答案 + 自动再播一次（教学补救）

interface Props {
  correct: boolean
  message?: string
  showAnswer?: string
  onContinue?: () => void
}

import { useEffect } from 'react'
export function AnswerFeedback({ correct, message, showAnswer, onContinue }: Props) {
  // 答错时自动再播一次正确答案（教学补救：让孩子听正确读音）
  useEffect(() => {
    if (!correct && showAnswer) {
      const t = setTimeout(() => {
        // showAnswer 是拼音字符串，用 speakPinyin 切片；fallback Web Speech
        void import('@/audio/tts').then(m => m.speakPinyin(showAnswer)).catch(() => {})
      }, 600)
      return () => clearTimeout(t)
    }
  }, [correct, showAnswer])

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${correct ? 'bg-sun-500/20' : 'bg-pig-500/20'}`}>
      <div className={`bg-white rounded-bubble p-8 mx-4 max-w-sm w-full shadow-2xl text-center ${correct ? 'border-4 border-sun-500' : 'border-4 border-pig-500'}`}>
        <div className="text-7xl mb-4">{correct ? '⭐' : '💪'}</div>
        <h2 className={`text-child-lg font-bold mb-3 ${correct ? 'text-sun-700' : 'text-pig-700'}`}>
          {correct ? '太棒了！' : '再想想'}
        </h2>
        {message && <p className="text-child text-slate-600 mb-3">{message}</p>}
        {showAnswer && !correct && (
          <div className="mb-4 p-3 bg-cream-50 rounded-soft">
            <p className="text-sm text-pig-500 mb-1">正确读音：</p>
            <p className="text-4xl pinyin-char font-bold text-sea-900">
              {showAnswer}
            </p>
          </div>
        )}
        <button
          onClick={onContinue}
          className="w-full bg-pig-500 text-white text-child font-bold py-4 rounded-bubble mt-2 active:scale-95"
        >
          继续 →
        </button>
      </div>
    </div>
  )
}
