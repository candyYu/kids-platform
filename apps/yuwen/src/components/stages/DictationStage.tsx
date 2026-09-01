// 阶段3 听写：用 9 键拼音键盘 + 四线三格
import { useState, useEffect, useMemo, useRef } from 'react'
import type { Lesson } from '@/data/lessons'
import { getQuestions } from '@/data/questionBank'
import { shuffle, jqxUmlaut, equalPinyin } from '@/utils/pinyin'
import { PinyinKeyboard } from '@/components/pinyin/PinyinKeyboard'
import { AnswerFeedback } from '@/components/feedback/AnswerFeedback'
import { Icon } from '@/components/icons/Icon'
import { db } from '@/db/schema'
import { nextReviewDate } from '@/utils/schedule'
import { speakHanzi, speakPinyin } from '@/audio/tts'

interface Props {
  lesson: Lesson
  onComplete: (correct: number, total: number) => void
}

const TONE_REGEX = /[\u0304\u0301\u030C\u0300]/

export function DictationStage({ lesson, onComplete }: Props) {
  const allQ = getQuestions(lesson.id).filter(q => q.type === 'imageToSyllable')
  // 全部 imageToSyllable 题都进入听写池（含多音节整词）
  // 多音节用 PinyinKeyboard 的 "· 下个" 累积模式答题
  const [questions] = useState(() => shuffle(allQ).slice(0, 6))
  const [idx, setIdx] = useState(0)
  const [feedback, setFeedback] = useState<{ correct: boolean; showAnswer?: string } | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  // 当前题的可选声母韵母（每题独立）
  const { hintInitials, hintFinals } = useMemo(() => {
    const initials = new Set<string>()
    const finals = new Set<string>()
    // 全部声母（含 zh/ch/sh 复合）
    const ALL_INIT = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']
    const stripTone = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    // 只看当前题
    const curr = questions[idx] as any
    if (!curr) return { hintInitials: [], hintFinals: [] }
    const ans = (curr.answer || '').toLowerCase()
    const syllables = ans.split(/\s+/).filter(Boolean)
    for (const syl of syllables) {
      // 提取声母
      let foundInit = ''
      for (const i of ALL_INIT) {
        if (syl.startsWith(i)) { initials.add(i); foundInit = i; break }
      }
      // 提取韵母（去掉声母后去声调）
      const rest = syl.slice(foundInit.length)
      const final = stripTone(rest).trim()
      if (final) finals.add(final)
    }
    return { hintInitials: Array.from(initials), hintFinals: Array.from(finals) }
  }, [questions, idx, lesson.id])

  // 切题时清掉旧的 setTimeout / 取消 Web Speech 避免双声互踩
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    // 1. 切题时先停掉旧题的所有声音
    if (speakTimer.current) {
      clearTimeout(speakTimer.current)
      speakTimer.current = null
    }
    try { window.speechSynthesis?.cancel() } catch {}
    if (questions[idx]) {
      const q = questions[idx] as any
      // imageDesc==='听音' 是 L01-q07a-d 听音辨调题的占位符（不是真实描述）：
      // 这类题的音频就是答案本身（ā/á/ǎ/à 切片），必须走 speakPinyin 播切片；
      // 之前把"听音"两个字当 desc 读了出来，孩子听到的是"听音"而不是题目
      const rawDesc = (q.imageDesc || '').trim()
      const desc = rawDesc === '听音' ? '' : rawDesc
      const ans = (q.answer || '').trim()
      // 4 声调链题（'ā á ǒ à'）：imageDesc 是 "a 的四个声调"，Web Speech 读不懂
      // → 改成逐个音节读：把 answer 拆空格每个音节 speakHanzi
      const syls = ans.split(/\s+/).filter(Boolean)
      const is4ToneChain = syls.length >= 3 && syls.every((s: string) => /^[a-zA-Z\u0100-\u017F]+$/.test(s) && s.length <= 2)
      speakTimer.current = setTimeout(() => {
        if (is4ToneChain) {
          // 4 声调链：按顺序串行读每个拼音（speakPinyin 找不到切片时 fallback 到 speakHanzi(desc)）
          // 串行 + 间隔 350ms，避免 mp3 抢断（之前 Promise.all 并行 → 只能听到最后一个音）
          void (async () => {
            for (const s of syls) {
              await speakPinyin(s, { fallbackHanzi: desc })
              await new Promise(r => setTimeout(r, 350))
            }
          })()
        } else if (desc) {
          speakHanzi(desc)
        } else {
          void import('@/audio/tts').then(m => m.speakPinyin(ans, { fallbackHanzi: desc }))
        }
      }, 400)
    }
    // cleanup：组件卸载或 idx/lesson 变化时清掉 timeout
    return () => {
      if (speakTimer.current) {
        clearTimeout(speakTimer.current)
        speakTimer.current = null
      }
    }
  }, [idx, questions, lesson.id])

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-child text-pig-700">本课暂无听写题</p>
        <button onClick={() => onComplete(0, 0)} className="mt-4 px-6 py-3 bg-pig-700 text-white rounded-soft">下一步</button>
      </div>
    )
  }

  const q = questions[idx] as any
  const rawDesc = (q.imageDesc || '').trim()
  // '听音' 是听音辨调题占位符（见 useEffect 注释），显示与音频都按"无描述"处理
  const desc = rawDesc === '听音' ? '' : rawDesc

  const submit = (userInput: string) => {
    // L01/L02 单韵母课：声调必须对（教学重点）
    // L03+ 整词课：每个音节去声调比较（声调不是重点）
    const ignoreTone = !['L01', 'L02'].includes(lesson.id)
    const correct = equalPinyin(q.answer, userInput, ignoreTone)
    
    if (correct) {
      setCorrectCount(c => c + 1)
      setFeedback({ correct: true })
    } else {
      void db.errorItems.add({
        lessonId: lesson.id,
        questionId: q.id,
        type: q.type,
        prompt: q.prompt,
        answer: q.answer,
        wrongAnswer: userInput,
        count: 1,
        lastWrongAt: Date.now(),
        nextReviewAt: nextReviewDate(0),
        doneCount: 0,
      })
      setFeedback({ correct: false, showAnswer: jqxUmlaut(q.answer) })
    }
  }

  const next = () => {
    setFeedback(null)
    if (idx + 1 >= questions.length) {
      onComplete(correctCount, questions.length)
    } else {
      setIdx(i => i + 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-pig-500">听写 {idx + 1} / {questions.length}</div>

      {/* 图 + 听 */}
      <div className="paper-card p-6 text-center">
        {q.imageEmoji ? (
          <div className="text-7xl mb-2">{q.imageEmoji}</div>
        ) : (
          <p className="text-pig-500 mb-2">{desc || q.prompt || '听音'}</p>
        )}
        {desc ? (
          <p className="text-pig-600 text-sm mb-3">看图：{desc}</p>
        ) : (
          q.prompt && <p className="text-pig-600 text-sm mb-3">{q.prompt}</p>
        )}
        <button
          onClick={() => speakHanzi(desc || q.answer)}
          className="w-24 h-24 rounded-full bg-pig-500 text-white shadow-lift active:scale-95 flex flex-col items-center justify-center mx-auto"
          aria-label="听发音"
        >
          <Icon name="volume" size={36} strokeWidth={2.4} />
          <span className="text-sm font-bold mt-1">听一听</span>
        </button>
      </div>

      {/* 9 键小键盘（key=q.id 让切题时重置 PinyinKeyboard 内部状态） */}
      <div>
        <PinyinKeyboard
          key={q.id}
          target={q.answer}
          targetHanzi={q.imageDesc}
          onSubmit={submit}
          hintInitials={hintInitials}
          hintFinals={hintFinals}
          finalsOnly={lesson.id === 'L01'}
        />
      </div>

      {feedback && (
        <AnswerFeedback
          correct={feedback.correct}
          showAnswer={feedback.showAnswer}
          onContinue={next}
        />
      )}
    </div>
  )
}
