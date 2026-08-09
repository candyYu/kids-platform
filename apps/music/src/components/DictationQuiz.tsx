import { useState, useCallback, useEffect, useRef } from 'react'
import type { DictationQuestion } from '@/types'
import { audioEngine } from '@/audio/engine'

/** 迷你节奏条：从选项文字中提取 Kodály 音节，显示彩色小方块 */
function MiniRhythm({ label }: { label: string }) {
  const syllables = label.match(/ta-a-a-a|ta-i|ta-a|ti-ri-ti-ri|ti-ri·ti|ti·ti-ri|ti-ti|ti-ri|ta|ti|休/g)
  if (!syllables || syllables.length === 0) return null
  return (
    <div className="flex gap-0.5 mt-2 justify-center flex-wrap">
      {syllables.map((s, i) => {
        let cls = 'h-2.5 rounded-sm '
        if (s === 'ta-a-a-a') cls += 'bg-purple-400 w-12'
        else if (s === 'ta-a' || s === 'ta-i') cls += 'bg-purple-400 w-8'
        else if (s === 'ti-ri-ti-ri') cls += 'bg-yellow-400 w-10'
        else if (s === 'ti-ti' || s === 'ti·ti-ri' || s === 'ti-ri·ti' || s === 'ti-ri') cls += 'bg-yellow-400 w-6'
        else if (s === '休') cls += 'bg-gray-300 w-4'
        else if (s === 'ta') cls += 'bg-purple-400 w-4'
        else if (s === 'ti') cls += 'bg-yellow-400 w-2'
        return <div key={i} className={cls} />
      })}
    </div>
  )
}

interface Props {
  questions: DictationQuestion[]
  onComplete: (correct: number, total: number, results: boolean[]) => void
  title?: string
}

export default function DictationQuiz({ questions, onComplete, title }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [playing, setPlaying] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const autoPlayedRef = useRef<Set<number>>(new Set())

  const question = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1

  const playAudio = useCallback(async () => {
    if (playing) return
    setPlaying(true)
    const { rhythm, notes, tempo, chord } = question.audio
    if (notes && notes.length > 0) {
      if (chord) {
        await audioEngine.playChord(notes)
      } else {
        await audioEngine.playMelody(notes, rhythm, tempo)
      }
    } else {
      await audioEngine.playAudioPattern(question.audio)
    }
    // 等待播放结束（节奏时长）
    const beatDur = 60 / tempo
    const totalBeats = rhythm.reduce((sum, r) => {
      const durs = audioEngine.patternToDurationsPublic(r)
      return sum + durs.reduce((s, d) => s + d, 0)
    }, 0)
    setTimeout(() => setPlaying(false), totalBeats * beatDur * 1000 + 300)
  }, [question, playing])

  // 自动播放：新题目出现时自动播放一次
  useEffect(() => {
    if (!autoPlayedRef.current.has(currentIdx)) {
      autoPlayedRef.current.add(currentIdx)
      playAudio()
    }
  }, [currentIdx, playAudio])

  const handleSelect = async (idx: number) => {
    if (answered) return
    setSelectedIdx(idx)
    setAnswered(true)

    if (idx === question.correctIndex) {
      setCorrectCount((c) => c + 1)
      setResults(r => [...r, true])
      await audioEngine.playCorrect()
    } else {
      setResults(r => [...r, false])
      await audioEngine.playWrong()
      // 答错后延迟 1 秒，播放正确答案的音频让孩子对比
      setShowHint(true)
      setTimeout(async () => {
        const { rhythm, notes, tempo, chord } = question.audio
        if (notes && notes.length > 0) {
          if (chord) {
            await audioEngine.playChord(notes)
          } else {
            await audioEngine.playMelody(notes, rhythm, tempo)
          }
        } else {
          await audioEngine.playAudioPattern(question.audio)
        }
      }, 1200)
    }
  }

  const handleNext = () => {
    if (isLast) {
      onComplete(correctCount, questions.length, results)
      return
    }
    setCurrentIdx((i) => i + 1)
    setSelectedIdx(null)
    setAnswered(false)
    setShowHint(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 进度条 */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-400">
          第 {currentIdx + 1} / {questions.length} 题
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentIdx ? 'bg-green-400' : i === currentIdx ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {title && <h2 className="text-xl font-bold text-center text-gray-700 mb-6">{title}</h2>}

      {/* 播放按钮 */}
      <div className="text-center mb-8">
        <button
          onClick={playAudio}
          disabled={playing}
          className={`w-24 h-24 rounded-full text-white text-4xl shadow-lg transition-all active:scale-95 ${playing ? 'bg-purple-300' : 'bg-purple-500 hover:bg-purple-600'}`}
        >
          {playing ? '🎵' : '🔊'}
        </button>
        <p className="text-sm text-gray-400 mt-3">
          {playing ? '播放中...' : '点击重新听'}
        </p>
      </div>

      {/* 选项 */}
      <div className="grid gap-3 mb-6">
        {question.options.map((opt, idx) => {
          let style = 'bg-white border-2 border-gray-200 hover:border-purple-300'
          if (answered) {
            if (idx === question.correctIndex) {
              style = 'bg-green-100 border-2 border-green-400'
            } else if (idx === selectedIdx) {
              style = 'bg-red-100 border-2 border-red-400'
            } else {
              style = 'bg-gray-50 border-2 border-gray-200 opacity-50'
            }
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`p-4 rounded-2xl text-lg font-bold text-gray-700 transition-all active:scale-95 ${style}`}
            >
              {answered && idx === question.correctIndex && '✅ '}
              {answered && idx === selectedIdx && idx !== question.correctIndex && '❌ '}
              {opt.label}
              <MiniRhythm label={opt.label} />
            </button>
          )
        })}
      </div>

      {/* 答错提示 + 手动重听 */}
      {showHint && (
        <div className="text-center mb-4">
          <button
            onClick={playAudio}
            disabled={playing}
            className="text-sm text-orange-500 bg-orange-50 rounded-xl py-2 px-4 inline-block hover:bg-orange-100 transition-all active:scale-95"
          >
            {playing ? '🎵 播放中...' : '🔔 再听一遍'}
          </button>
        </div>
      )}

      {/* 下一题 */}
      {answered && (
        <div className="text-center">
          <button onClick={handleNext} className="btn-primary">
            {isLast ? '查看结果' : '下一题 →'}
          </button>
        </div>
      )}
    </div>
  )
}
