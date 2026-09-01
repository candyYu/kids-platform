// 阅读课/识字课学习页：听读 → 认字 → 练（三阶段，配拼音课 5 阶段之外的轻量流程）
// 音频：优先 /audio/reading/{id}/line-{N}.mp3（构建前 gen-reading-audio.mjs 生成），
//       缺文件时回退浏览器 speechSynthesis（zh-CN）
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Lesson } from '@/data/types'
import { getLessonText, lessonChars, ACTIVE_GRADE } from '@/data'
import { db } from '@/db/schema'

type Stage = 'listen' | 'chars' | 'quiz'

const STAGES: { key: Stage; label: string; emoji: string }[] = [
  { key: 'listen', label: '听读', emoji: '👂' },
  { key: 'chars', label: '认字', emoji: '🔤' },
  { key: 'quiz', label: '练一练', emoji: '🎯' },
]

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-CN'
    u.rate = 0.85
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch { /* 无 TTS 环境 */ }
}

export default function ReadingLesson({ lesson }: { lesson: Lesson }) {
  const text = useMemo(
    () => (lesson.textId ? getLessonText(ACTIVE_GRADE, lesson.textId) : undefined),
    [lesson.textId],
  )
  const [stage, setStage] = useState<Stage>('listen')
  const [playing, setPlaying] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chars = useMemo(() => (text ? lessonChars(text) : []), [text])

  // 生成行音频 URL 列表（子应用部署在 /yuwen/ 下，必须拼 BASE_URL）
  const lineUrls = useMemo(() => {
    if (!text) return []
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    return text.lines.map((_, i) => `${base}/audio/reading/${lesson.id}/line-${i + 1}.mp3`)
  }, [text, lesson.id])

  useEffect(() => () => {
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()
  }, [])

  if (!text) {
    return (
      <div className="p-6 text-center">
        <p className="text-sea-900 font-bold">课文内容还没录入</p>
        <p className="text-sm text-pig-500 mt-2">老师可在 /teacher 页录入本课文本</p>
      </div>
    )
  }

  function playLine(i: number) {
    audioRef.current?.pause()
    setPlaying(i)
    const url = lineUrls[i]
    const a = new Audio(url)
    audioRef.current = a
    a.onended = () => setPlaying(-1)
    a.onerror = () => {
      // 回退：浏览器 TTS 逐行读
      speak(text!.lines[i])
      setPlaying(-1)
    }
    void a.play().catch(() => speak(text!.lines[i]))
  }

  function playAll() {
    let i = 0
    const next = () => {
      if (i >= text!.lines.length) { setPlaying(-1); return }
      playLine(i)
      const a = audioRef.current
      if (a) a.onended = () => { i++; next() }
    }
    next()
  }

  async function finish(score: number) {
    const rec = await db.lessons.get(lesson.id)
    const stars = score >= 0.8 ? 3 : score >= 0.6 ? 2 : 1
    await db.lessons.put({
      id: lesson.id,
      unlocked: 1,
      stars: Math.max(rec?.stars ?? 0, stars),
      bestScore: Math.max(rec?.bestScore ?? 0, Math.round(score * 10)),
      completedAt: Date.now(),
    })
    setStage('listen')
  }

  const stageIdx = STAGES.findIndex(s => s.key === stage)

  return (
    <main className="min-h-screen bg-cream-50 pb-24">
      <style>{`audio{display:none}`}</style>
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-pig-100 p-4">
        <div className="text-child font-bold text-sea-900">{lesson.code} · {lesson.name}</div>
        <div className="flex gap-1 mt-3">
          {STAGES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStage(s.key)}
              className={`flex-1 h-11 rounded-soft text-sm font-bold flex items-center justify-center gap-1 transition ${
                i === stageIdx ? 'bg-pig-500 text-white' : i < stageIdx ? 'bg-pig-100 text-pig-700' : 'bg-white text-pig-500 border border-pig-200'
              }`}
            >
              <span>{s.emoji}</span><span>{s.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-md mx-auto p-4">
        {stage === 'listen' && (
          <section>
            <button onClick={playAll} className="w-full bg-pig-500 text-white rounded-bubble p-4 font-bold text-child-lg mb-4 active:scale-95">
              ▶️ 整课朗读
            </button>
            <div className="space-y-2">
              {text.lines.map((line, i) => (
                line.trim() === '' ? <div key={i} className="h-2" /> : (
                  <button
                    key={i}
                    onClick={() => playLine(i)}
                    className={`w-full text-left p-4 rounded-soft border-2 transition text-child leading-relaxed ${
                      playing === i ? 'bg-pig-100 border-pig-400' : 'bg-white border-pig-200'
                    }`}
                  >
                    {playing === i ? '🔊 ' : ''}{line}
                  </button>
                )
              ))}
            </div>
            <p className="text-xs text-pig-500 text-center mt-4">点句子跟读 · 点上方按钮整课听</p>
            <button onClick={() => setStage('chars')} className="w-full bg-sun-400 text-sea-900 rounded-bubble p-4 font-bold mt-4 active:scale-95">
              认识本课生字 →
            </button>
          </section>
        )}

        {stage === 'chars' && (
          <section>
            <h2 className="text-child font-bold text-sea-900 mb-3">点一点，听发音</h2>
            <div className="grid grid-cols-4 gap-3">
              {chars.map(ch => (
                <button
                  key={ch}
                  onClick={() => speak(ch)}
                  className="aspect-square bg-white rounded-bubble border-2 border-pig-200 text-4xl font-bold text-sea-900 active:scale-95 active:bg-pig-100"
                >
                  {ch}
                </button>
              ))}
            </div>
            <button onClick={() => setStage('quiz')} className="w-full bg-sun-400 text-sea-900 rounded-bubble p-4 font-bold mt-6 active:scale-95">
              练一练 →
            </button>
          </section>
        )}

        {stage === 'quiz' && <QuizStage chars={chars} onDone={finish} />}
      </div>
    </main>
  )
}

// ---- 听音选字：播放字音，从 4 个同课字里选 ----
function QuizStage({ chars, onDone }: { chars: string[]; onDone: (score: number) => void }) {
  const qs = useMemo(() => {
    const pool = [...chars]
    const out: { answer: string; options: string[] }[] = []
    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const answer = pool[i]
      const distract = pool.filter(c => c !== answer).sort(() => Math.random() - 0.5).slice(0, 3)
      out.push({ answer, options: [answer, ...distract].sort(() => Math.random() - 0.5) })
    }
    return out
  }, [chars])

  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const q = qs[idx]
  useEffect(() => { if (q) speak(q.answer) }, [q])

  if (!q) {
    return (
      <div className="text-center p-6">
        <p className="text-child text-pig-500">本课没有可练的生字</p>
      </div>
    )
  }

  if (idx >= qs.length) {
    const score = correct / qs.length
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">{score >= 0.8 ? '🏆' : score >= 0.6 ? '🌟' : '💪'}</div>
        <p className="text-child-lg font-bold text-sea-900">{correct} / {qs.length} 全对啦！</p>
        <button onClick={() => onDone(score)} className="w-full bg-pig-500 text-white rounded-bubble p-4 font-bold mt-6 active:scale-95">
          完成
        </button>
      </div>
    )
  }

  return (
    <section>
      <p className="text-center text-pig-500 text-sm mb-2">第 {idx + 1} / {qs.length} 题 · 听发音选字</p>
      <button
        onClick={() => speak(q.answer)}
        className="block mx-auto w-24 h-24 rounded-full bg-sun-300 text-4xl active:scale-95 mb-6"
        aria-label="再听一次"
      >🔊</button>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => {
          const isPicked = picked === opt
          const isAnswer = opt === q.answer
          return (
            <button
              key={opt}
              disabled={!!picked}
              onClick={() => {
                setPicked(opt)
                if (isAnswer) setCorrect(c => c + 1)
                setTimeout(() => { setPicked(null); setIdx(i => i + 1) }, 700)
              }}
              className={`aspect-square rounded-bubble text-5xl font-bold transition ${
                picked
                  ? isAnswer ? 'bg-green-200 border-4 border-green-500' : isPicked ? 'bg-red-100 border-4 border-red-300' : 'bg-white border-2 border-pig-200 opacity-50'
                  : 'bg-white border-2 border-pig-200 active:scale-95'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </section>
  )
}
