// 课本同步课程页：卡片序列（讲解→练习），6 种题型
// teach/choice/fill/match/count/compare
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { lessonById, unitById } from '@/data/lessons'
import { db, today } from '@/db/schema'
import { speak } from '@/tts'
import { shuffle, numToCn } from '@/data/topics'
import { ACTIVE_GRADE } from '@/data/grade'
import type { LessonCard } from '@/data/lessons'

/** 把算式/题目文本转成可靠的中文读法（× → 乘，数字 → 一二三） */
function exprToPrompt(expr: string): string {
  return expr
    .replace(/(\d+)/g, n => numToCn(Number(n)))
    .replace(/×/g, '乘')
    .replace(/\+/g, '加')
    .replace(/[−-]/g, '减')
    .replace(/÷/g, '除以')
    .replace(/=\s*\?/g, '等于几')
    .replace(/（　）/g, '多少')
    .replace(/\?/g, '几')
}

export default function LessonPage() {
  const { lessonId = '' } = useParams()
  const navigate = useNavigate()
  const lesson = lessonById(lessonId)

  const [idx, setIdx] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [finished, setFinished] = useState(false)

  if (!lesson) {
    return (
      <main className="min-h-screen p-6 text-center">
        <p className="text-child-lg mt-20">课程不存在</p>
        <button onClick={() => navigate('/')} className="btn-pig px-8 py-3 mt-6">回首页</button>
      </main>
    )
  }

  const card = lesson.cards[idx]
  const total = lesson.cards.length

  const next = (wasWrong: boolean) => {
    if (wasWrong) setWrong(w => w + 1)
    if (idx + 1 >= total) {
      const stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1
      const key = `${today()}|${lesson.id}`
      void db.daily.get(key).then(prev => {
        void db.daily.put({
          key, g: ACTIVE_GRADE, day: today(), topic: lesson.id,
          bestStars: Math.max(prev?.bestStars ?? 0, stars),
          plays: (prev?.plays ?? 0) + 1, lastTs: Date.now(),
        })
      })
      setFinished(true)
      if (stars >= 2) void speak(stars === 3 ? '太厉害了' : '真棒')
    } else {
      setIdx(i => i + 1)
    }
  }

  if (finished) {
    const stars = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-child-xl font-bold text-pig-700 mb-2">
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </h1>
        <p className="text-child-lg text-ink-700 mb-1">学完了《{lesson.title}》</p>
        <p className="text-child text-ink-500 mb-8">{wrong === 0 ? '全部答对，真棒！' : `答错 ${wrong} 次，可以再练一遍`}</p>
        <div className="flex gap-3">
          <button onClick={() => { setIdx(0); setWrong(0); setFinished(false) }} className="btn-pig px-8 py-3">再学一遍</button>
          <button onClick={() => navigate(-1)} className="px-8 py-3 rounded-soft bg-white text-pig-600 font-bold border-2 border-pig-200 active:scale-95">回课程表</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      {/* 顶栏 */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-child text-pig-500 font-bold px-2">← 退出</button>
        <span className="text-child font-bold text-ink-700">{lesson.title}</span>
        <span className="text-child text-ink-500 font-bold">{idx + 1}/{total}</span>
      </div>

      <Card key={idx} card={card} onNext={next} />
    </main>
  )
}

// ---------- 卡片渲染 ----------

function Card({ card, onNext }: { card: LessonCard; onNext: (wasWrong: boolean) => void }) {
  switch (card.type) {
    case 'teach': return <TeachCard card={card} onNext={onNext} />
    case 'choice': return <ChoiceCard card={card} onNext={onNext} />
    case 'fill': return <FillCard card={card} onNext={onNext} />
    case 'match': return <MatchCard card={card} onNext={onNext} />
    case 'count': return <CountCard card={card} onNext={onNext} />
    case 'compare': return <CompareCard card={card} onNext={onNext} />
  }
}

function TeachCard({ card, onNext }: { card: Extract<LessonCard, { type: 'teach' }>; onNext: (w: boolean) => void }) {
  useEffect(() => { void speak(card.body.replace(/\n/g, '，'), 0.85) }, [card])
  return (
    <div className="paper-card w-full max-w-md p-8 text-center">
      <div className="text-6xl mb-4">{card.emoji ?? '📖'}</div>
      <h2 className="text-child-lg font-bold text-pig-700 mb-4">{card.title}</h2>
      <p className="text-child text-ink-700 leading-relaxed whitespace-pre-line text-left">{card.body}</p>
      <div className="flex justify-center gap-3 mt-6">
        <button onClick={() => void speak(card.body.replace(/\n/g, '，'), 0.85)} className="w-12 h-12 rounded-full bg-pig-100 text-pig-600 text-xl active:scale-95">🔊</button>
        <button onClick={() => onNext(false)} className="btn-pig px-10 py-3">我知道了 →</button>
      </div>
    </div>
  )
}

function ChoiceCard({ card, onNext }: { card: Extract<LessonCard, { type: 'choice' }>; onNext: (w: boolean) => void }) {
  // 选项洗牌：正确答案不能总在同一个位置（否则孩子会发现规律不用思考）
  const [order] = useState(() => shuffle(card.options.map((_, i) => i)))
  const correctIdx = order.indexOf(card.answer)
  const [picked, setPicked] = useState<number | null>(null)
  const [showAns, setShowAns] = useState(false)
  useEffect(() => { void speak(card.q) }, [card])
  const pick = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === correctIdx) {
      setTimeout(() => onNext(false), 700)
    } else {
      setShowAns(true)
    }
  }
  return (
    <div className="w-full max-w-md">
      <div className="paper-card p-6 text-center mb-4">
        <p className="text-child-lg font-bold text-ink-900">{card.q}</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {order.map((oi, i) => {
          const opt = card.options[oi]
          let cls = 'bg-white border-pig-200 text-ink-900'
          if (picked === i && i === correctIdx) cls = 'bg-grass-500 border-grass-600 text-white'
          else if (picked === i) cls = 'bg-chili-500 border-chili-600 text-white'
          else if (showAns && i === correctIdx) cls = 'bg-grass-100 border-grass-500 text-grass-700'
          return (
            <button key={i} onClick={() => pick(i)} className={`p-4 rounded-soft border-2 text-child font-bold active:scale-95 transition ${cls}`}>
              {opt}
            </button>
          )
        })}
      </div>
      {showAns && (
        <div className="mt-4 text-center">
          <p className="text-child font-bold text-chili-600 mb-3">正确答案是：{card.options[card.answer]}</p>
          <button onClick={() => onNext(true)} className="px-8 py-3 rounded-soft bg-sun-500 text-white font-bold active:scale-95">继续</button>
        </div>
      )}
    </div>
  )
}

/** fill / count 共用的数字键盘块 */
function Keypad({ input, setInput, onSubmit, disabled }: { input: string; setInput: (s: string) => void; onSubmit: () => void; disabled: boolean }) {
  return (
    <div className="w-full max-w-md mt-4 grid grid-cols-3 gap-2">
      {['1','2','3','4','5','6','7','8','9'].map(n => (
        <button key={n} onClick={() => { if (!disabled) setInput(input.length < 2 ? input + n : input) }}
          className="aspect-square bg-white rounded-2xl shadow-card text-4xl font-bold text-pig-600 active:scale-95 active:bg-pig-50">{n}</button>
      ))}
      <button onClick={() => setInput(input.slice(0, -1))} className="aspect-square bg-white rounded-2xl shadow-card text-3xl font-bold text-ink-500 active:scale-95">⌫</button>
      <button onClick={() => { if (!disabled) setInput(input.length < 2 ? input + '0' : input) }}
        className="aspect-square bg-white rounded-2xl shadow-card text-4xl font-bold text-pig-600 active:scale-95 active:bg-pig-50">0</button>
      <button onClick={onSubmit} disabled={!input || disabled}
        className="aspect-square rounded-2xl bg-grass-500 text-white text-child font-bold shadow-grass active:scale-95 disabled:opacity-40">✓</button>
    </div>
  )
}

function FillCard({ card, onNext }: { card: Extract<LessonCard, { type: 'fill' }>; onNext: (w: boolean) => void }) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<null | { ok: boolean }>(null)
  useEffect(() => { void speak(exprToPrompt(card.expr), 0.9) }, [card])
  const submit = () => {
    if (!input || feedback) return
    const ok = Number(input) === card.answer
    setFeedback({ ok })
    if (ok) setTimeout(() => onNext(false), 700)
  }
  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <div className="paper-card w-full p-8 text-center">
        <p className="text-4xl font-bold text-ink-900">{card.expr}</p>
        {card.hint && <p className="text-child text-ink-500 mt-2">💡 {card.hint}</p>}
      </div>
      <div className="w-full mt-4 h-16 rounded-soft bg-white border-4 border-pig-200 flex items-center justify-center">
        <span className="text-5xl font-bold text-pig-600">{input || <span className="text-pig-200">?</span>}</span>
      </div>
      {feedback && !feedback.ok && (
        <div className="w-full mt-3 p-3 rounded-soft text-child font-bold text-center bg-chili-50 text-chili-600">
          再想想，正确答案：{card.answer}
          <button onClick={() => onNext(true)} className="block mx-auto mt-2 px-8 py-2 rounded-soft bg-sun-500 text-white active:scale-95">继续</button>
        </div>
      )}
      <Keypad input={input} setInput={setInput} onSubmit={submit} disabled={feedback?.ok === true} />
    </div>
  )
}

function CountCard({ card, onNext }: { card: Extract<LessonCard, { type: 'count' }>; onNext: (w: boolean) => void }) {
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<null | { ok: boolean }>(null)
  useEffect(() => { void speak(card.q ?? '数一数，有几个？') }, [card])
  const submit = () => {
    if (!input || feedback) return
    const ok = Number(input) === card.n
    setFeedback({ ok })
    if (ok) setTimeout(() => onNext(false), 700)
  }
  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <div className="paper-card w-full p-6 text-center">
        <p className="text-child-lg font-bold text-ink-900 mb-3">{card.q ?? '数一数，有几个？'}</p>
        <div className="flex flex-wrap justify-center gap-2 text-5xl">
          {Array.from({ length: card.n }).map((_, i) => <span key={i}>{card.emoji}</span>)}
        </div>
      </div>
      <div className="w-full mt-4 h-16 rounded-soft bg-white border-4 border-pig-200 flex items-center justify-center">
        <span className="text-5xl font-bold text-pig-600">{input || <span className="text-pig-200">?</span>}</span>
      </div>
      {feedback && !feedback.ok && (
        <div className="w-full mt-3 p-3 rounded-soft text-child font-bold text-center bg-chili-50 text-chili-600">
          再数一数，答案是：{card.n}
          <button onClick={() => onNext(true)} className="block mx-auto mt-2 px-8 py-2 rounded-soft bg-sun-500 text-white active:scale-95">继续</button>
        </div>
      )}
      <Keypad input={input} setInput={setInput} onSubmit={submit} disabled={feedback?.ok === true} />
    </div>
  )
}

function CompareCard({ card, onNext }: { card: Extract<LessonCard, { type: 'compare' }>; onNext: (w: boolean) => void }) {
  const [feedback, setFeedback] = useState<null | { ok: boolean; picked: string }>(null)
  const correct = card.a > card.b ? '>' : card.a < card.b ? '<' : '='
  useEffect(() => { void speak(`${numToCn(card.a)} 和 ${numToCn(card.b)}，谁大谁小？`) }, [card])
  const pick = (sym: string) => {
    if (feedback) return
    const ok = sym === correct
    setFeedback({ ok, picked: sym })
    if (ok) setTimeout(() => onNext(false), 700)
  }
  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <div className="paper-card w-full p-8 text-center">
        <p className="text-6xl font-bold text-ink-900 tracking-widest">
          {card.a} <span className="text-pig-300">{feedback ? correct : '?'}</span> {card.b}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full mt-4">
        {['>', '=', '<'].map(sym => {
          let cls = 'bg-white text-pig-600 shadow-card'
          if (feedback && feedback.picked === sym && feedback.ok) cls = 'bg-grass-500 text-white'
          else if (feedback && feedback.picked === sym) cls = 'bg-chili-500 text-white'
          return (
            <button key={sym} onClick={() => pick(sym)} className={`p-5 rounded-2xl text-5xl font-bold active:scale-95 ${cls}`}>{sym}</button>
          )
        })}
      </div>
      {feedback && !feedback.ok && (
        <div className="w-full mt-3 p-3 rounded-soft text-child font-bold text-center bg-chili-50 text-chili-600">
          {card.a} {correct} {card.b}
          <button onClick={() => onNext(true)} className="block mx-auto mt-2 px-8 py-2 rounded-soft bg-sun-500 text-white active:scale-95">继续</button>
        </div>
      )}
    </div>
  )
}

function MatchCard({ card, onNext }: { card: Extract<LessonCard, { type: 'match' }>; onNext: (w: boolean) => void }) {
  const [rights] = useState(() => shuffle(card.pairs.map(p => p[1])))
  const [selL, setSelL] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string | null>(null)
  const wasWrong = useRef(false)
  useEffect(() => { void speak('连一连，找朋友') }, [card])

  const pickR = (r: string) => {
    if (!selL || done.has(r)) return
    const pair = card.pairs.find(p => p[0] === selL)
    if (pair && pair[1] === r) {
      const nd = new Set(done)
      nd.add(selL)
      setDone(nd)
      setSelL(null)
      if (nd.size === card.pairs.length) {
        setTimeout(() => onNext(wasWrong.current), 700)
      }
    } else {
      wasWrong.current = true
      setWrongPair(r)
      setTimeout(() => setWrongPair(null), 500)
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-child font-bold text-ink-700 text-center mb-3">连一连：先点左边，再点右边</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {card.pairs.map(([l]) => (
            <button key={l} onClick={() => { if (!done.has(l)) setSelL(l) }}
              className={`p-4 rounded-soft border-2 text-child font-bold active:scale-95 transition ${
                done.has(l) ? 'bg-grass-100 border-grass-500 text-grass-700 opacity-60'
                : selL === l ? 'bg-pig-500 border-pig-600 text-white'
                : 'bg-white border-pig-200 text-ink-900'}`}>{l}</button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rights.map(r => {
            const isDone = [...done].some(l => card.pairs.find(p => p[0] === l)?.[1] === r)
            return (
              <button key={r} onClick={() => pickR(r)}
                className={`p-4 rounded-soft border-2 text-child font-bold active:scale-95 transition ${
                  isDone ? 'bg-grass-100 border-grass-500 text-grass-700 opacity-60'
                  : wrongPair === r ? 'bg-chili-500 border-chili-600 text-white'
                  : 'bg-white border-sky-200 text-ink-900'}`}>{r}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
