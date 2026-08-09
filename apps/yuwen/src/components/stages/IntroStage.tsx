// 阶段1 认识：展示本课字母 + 发音 + 听音跟读
import { LESSONS, type Lesson } from '@/data/lessons'
import { LetterCard } from '@/components/pinyin/LetterCard'
import { useState } from 'react'
import { Icon } from '@/components/icons/Icon'

interface Props {
  lesson: Lesson
  onComplete: () => void
}

export function IntroStage({ lesson, onComplete }: Props) {
  const [step, setStep] = useState(0)

  // 从 lesson.name 提取字母/声母/韵母
  // 简化：按课号硬编码主要学习字母
  const letters = getIntroLetters(lesson.id)
  const totalSteps = letters.length + 1  // 所有字母展示完 + 1 个"准备好了"

  if (step >= letters.length) {
    return (
      <div className="text-center py-12">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="text-child-lg font-bold text-sea-900 mb-3">认识完啦！</h2>
        <p className="text-child text-pig-700 mb-8">点下面的按钮去听老师示范</p>
        <button
          onClick={onComplete}
          className="px-10 py-5 bg-pig-500 text-white text-child font-bold rounded-bubble shadow-bubble active:scale-95"
        >
          看视频 →
        </button>
      </div>
    )
  }

  const current = letters[step]
  
  // 声母列表（没有四声）
  const INITIALS = new Set(['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'z', 'c', 's', 'zh', 'ch', 'sh', 'r', 'y', 'w'])
  const isInitial = INITIALS.has(current)
  
  // 只有韵母才生成四声，声母不用
  const tones = isInitial ? [] : [1, 2, 3, 4].map(tone => {
    const base = current
    if (tone === 1) return base + '\u0304'  // ˉ
    if (tone === 2) return base + '\u0301'  // ˊ
    if (tone === 3) return base + '\u030C'  // ˇ
    return base + '\u0300'                    // ˋ
  }).map(t => t.normalize('NFC'))

  return (
    <div>
      <div className="text-center mb-6">
        <p className="text-sm text-pig-500">第 {step + 1} / {letters.length}</p>
      </div>
      <div className="flex flex-col items-center gap-8">
         <LetterCard char={current} tones={tones.map((char, i) => ({ tone: (i + 1) as 1 | 2 | 3 | 4, char }))} size="xl" autoPlay />
        <p className="text-child text-pig-700 text-center">
          {isInitial ? '点字母听发音，跟读两遍' : '点字母听四声发音，跟读两遍'}
        </p>
        <div className="flex gap-4 items-center justify-center">
          {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-20 h-20 rounded-full bg-white border-2 border-pig-200 flex items-center justify-center text-pig-700 shadow-card active:scale-95"
          >
            <Icon name="arrow-left" size={28} />
          </button>
          )}
          <button
            onClick={() => {
              void import('@/audio/tts').then(({ speakPinyin }) => {
                if (isInitial) {
                  // 声母直接播放
                  speakPinyin(current)
                } else {
                  // 韵母播放四声
                  (async () => {
                    for (const t of tones) {
                      await speakPinyin(t)
                      await new Promise(r => setTimeout(r, 300))
                    }
                  })()
                }
              })
            }}
            className="w-20 h-20 rounded-full bg-pig-500 text-white shadow-lift active:scale-95 flex items-center justify-center"
          >
            <Icon name="volume" size={36} />
          </button>
          <button
            onClick={() => setStep(s => s + 1)}
            className="w-20 h-20 rounded-full bg-pig-500 text-white shadow-card active:scale-95 flex items-center justify-center"
          >
            <Icon name="arrow-right" size={28} />
          </button>
        </div>
      </div>
    </div>
  )
}

function getIntroLetters(lessonId: string): string[] {
  // 简化：取 lesson.name 的字母
  const map: Record<string, string[]> = {
    L01: ['a', 'o', 'e'],
    L02: ['i', 'u', 'ü', 'y', 'w'],
    L03: ['b', 'p', 'm', 'f'],
    L04: ['d', 't', 'n', 'l'],
    L05: ['g', 'k', 'h'],
    L06: ['j', 'q', 'x'],
    L07: ['z', 'c', 's'],
    L08: ['zh', 'ch', 'sh', 'r'],
    L09: ['ai', 'ei', 'ui'],
    L10: ['ao', 'ou', 'iu'],
    L11: ['ie', 'üe', 'er'],
    L12: ['an', 'en', 'in', 'un', 'ün'],
    L13: ['ang', 'eng', 'ing', 'ong'],
  }
  return map[lessonId] || []
}
