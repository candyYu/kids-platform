// 练习页：10 题一组，大题面 + 9 键数字键盘 + 语音读题
// 有余数除法是两步题：先答商，再答余数（按题目自带 rem 判断，错题重练也适用）
import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { topicById, makeSession, numToCn, shuffle } from '@/data/topics'
import { db, today } from '@/db/schema'
import { speak } from '@/tts'
import type { Problem, Topic } from '@/data/topics'
import { ACTIVE_GRADE } from '@/data/grade'

const SESSION_LEN = 10

const RETRY_TOPIC: Topic = {
  id: 'retry',
  g: '2',
  name: '错题重练',
  emoji: '📕',
  desc: '打败错题',
  gen: () => { throw new Error('retry 模式不生成新题') },
}

export default function Practice() {
  const { topicId = '' } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRetry = topicId === 'retry'
  const topic = isRetry ? RETRY_TOPIC : topicById(topicId)
  // ?t=60 → 1 分钟计时挑战（错题重练不支持）；一次备 30 题，1 分钟做不完
  const timed = !isRetry && searchParams.get('t') === '60'

  const [problems, setProblems] = useState<Problem[]>(() =>
    topic && !isRetry ? makeSession(topic, timed ? 30 : SESSION_LEN) : [],
  )
  const [left, setLeft] = useState(60)
  const [loaded, setLoaded] = useState(!isRetry)   // retry 模式异步取题后置 true
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [stage, setStage] = useState<0 | 1>(0)   // 有余数题：0=答商 1=答余数
  const [feedback, setFeedback] = useState<null | { ok: boolean; showAns?: string }>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [streak, setStreak] = useState(0)
  const [finished, setFinished] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 错题重练：异步从错题本取题
  useEffect(() => {
    if (!isRetry) return
    let alive = true
    void db.errors.toArray().then(errs => {
      if (!alive) return
      const ps: Problem[] = errs.slice(0, SESSION_LEN).map(e => ({
        a: e.a, op: e.op, b: e.b, ans: e.ans, rem: e.rem,
        expr: e.expr, prompt: e.prompt,
      }))
      setProblems(shuffle(ps))
      setLoaded(true)
    })
    return () => { alive = false }
  }, [isRetry])

  const q = problems[idx]

  // 切题自动读题
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    try { window.speechSynthesis?.cancel() } catch { /* ignore */ }
    if (!q) return
    const stageHint = q.rem != null && stage === 1 ? '，余数是几' : ''
    timer.current = setTimeout(() => {
      void speak(q.prompt + stageHint)
    }, 350)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [idx, q, stage])

  // 计时挑战：60 秒倒计时，到点自动收卷
  useEffect(() => {
    if (!timed || finished || problems.length === 0) return
    const iv = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000)
    return () => clearInterval(iv)
  }, [timed, finished, problems.length])

  useEffect(() => {
    if (timed && left === 0 && !finished) setFinished(true)
  }, [timed, left, finished])

  if (!topic) {
    return (
      <main className="min-h-screen p-6 text-center">
        <p className="text-child-lg mt-20">题卡不存在</p>
        <button onClick={() => navigate('/')} className="btn-pig px-8 py-3 mt-6">回首页</button>
      </main>
    )
  }

  if (problems.length === 0) {
    if (isRetry && loaded) {
      // 错题本空了
      return (
        <main className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
          <p className="text-5xl mb-3">🎊</p>
          <p className="text-child-lg text-ink-700 mb-6">错题都打败了！</p>
          <button onClick={() => navigate('/')} className="btn-pig px-8 py-3">回首页</button>
        </main>
      )
    }
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-child text-ink-500">准备题目中…</p>
      </main>
    )
  }

  const twoStage = q.rem != null

  const record = (userAns: string, ok: boolean) => {
    void db.attempts.add({
      g: ACTIVE_GRADE,
      topic: topic.id,
      expr: q.expr,
      userAns,
      correct: ok ? 1 : 0,
      ts: Date.now(),
    })
    if (!ok) {
      const key = q.expr
      void db.errors.get(key).then(prev => {
        void db.errors.put({
          key,
          g: ACTIVE_GRADE,
          topic: isRetry ? (q.rem != null ? 'divRem' : 'retry') : topic.id,
          a: q.a, op: q.op, b: q.b, ans: q.ans, rem: q.rem,
          expr: q.expr,
          prompt: q.prompt,
          count: (prev?.count ?? 0) + 1,
          lastWrongAt: Date.now(),
        })
      })
    }
  }

  const submit = () => {
    if (!input || feedback) return
    if (twoStage && stage === 0) {
      // 第一步：商
      if (Number(input) === q.ans) {
        setStage(1)
        setInput('')
        setFeedback({ ok: true })
        setTimeout(() => setFeedback(null), 700)
      } else {
        record(input, false)
        setFeedback({ ok: false, showAns: `${q.ans}……${q.rem}` })
      }
      return
    }
    const target = twoStage ? q.rem! : q.ans
    const ok = Number(input) === target
    record(input, ok)
    if (ok) {
      if (isRetry) void db.errors.delete(q.expr)  // 重练答对 → 移出错题本
      setCorrectCount(c => c + 1)
      const s = streak + 1
      setStreak(s)
      setBestStreak(b => Math.max(b, s))
      setFeedback({ ok: true })
      setTimeout(() => next(), 650)
    } else {
      setStreak(0)
      setFeedback({
        ok: false,
        showAns: twoStage ? `${q.ans}……${q.rem}` : String(q.ans),
      })
    }
  }

  const next = () => {
    setFeedback(null)
    setInput('')
    setStage(0)
    if (idx + 1 >= problems.length) {
      // 收尾：存当日最佳星星（错题重练不计入题卡星星）
      if (!isRetry) {
        const stars = correctCount >= 10 ? 3 : correctCount >= 8 ? 2 : correctCount >= 6 ? 1 : 0
        const key = `${today()}|${topic.id}${timed ? '#timed' : ''}`
        void db.daily.get(key).then(prev => {
          void db.daily.put({
            key,
            g: ACTIVE_GRADE,
            day: today(),
            topic: topic.id,
            bestStars: Math.max(prev?.bestStars ?? 0, stars),
            plays: (prev?.plays ?? 0) + 1,
            lastTs: Date.now(),
          })
        })
      }
      setFinished(true)
    } else {
      setIdx(i => i + 1)
    }
  }

  // ---------- 结果页 ----------
  if (finished) {
    const stars = correctCount >= 10 ? 3 : correctCount >= 8 ? 2 : correctCount >= 6 ? 1 : 0
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4">{stars > 0 ? '🎉' : '💪'}</div>
        <h1 className="text-child-xl font-bold text-pig-700 mb-2">
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </h1>
        <p className="text-child-lg text-ink-700 mb-1">
          {timed ? `⏱ 1 分钟答对 ${correctCount} 题` : `答对 ${correctCount} / ${problems.length} 题`}
        </p>
        <p className="text-child text-ink-500 mb-8">
          {timed ? '课标要求：每分钟 8~10 题 · ' : ''}最高连对 {bestStreak} 题
        </p>
        <div className="flex gap-3">
          {!isRetry && (
            <button
              onClick={() => { setProblems(makeSession(topic, timed ? 30 : SESSION_LEN)); setIdx(0); setInput(''); setStage(0); setFeedback(null); setCorrectCount(0); setStreak(0); setBestStreak(0); setLeft(60); setFinished(false) }}
              className="btn-pig px-8 py-3"
            >
              {timed ? '再挑战一次' : '再练一组'}
            </button>
          )}
          <button onClick={() => navigate('/')} className="px-8 py-3 rounded-soft bg-white text-pig-600 font-bold border-2 border-pig-200 active:scale-95">
            回首页
          </button>
        </div>
      </main>
    )
  }

  // ---------- 答题页 ----------
  const stageLabel = twoStage
    ? (stage === 0 ? '第 1 步：商是几？' : `第 2 步：余数是几？（${numToCn(q.b)} 除）`)
    : ''

  return (
    <main className="min-h-screen p-6 flex flex-col items-center">
      {/* 顶栏：进度 + 退出（计时模式显示倒计时） */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button onClick={() => navigate('/')} className="text-child text-pig-500 font-bold px-2">← 退出</button>
        {timed ? (
          <span className={`text-child-lg font-bold ${left <= 10 ? 'text-chili-600' : 'text-pig-600'}`}>⏱ {left}s</span>
        ) : (
          <div className="flex gap-1">
            {problems.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i < idx ? 'bg-grass-500' : i === idx ? 'bg-pig-500' : 'bg-pig-100'}`}
              />
            ))}
          </div>
        )}
        <span className="text-child text-ink-500 font-bold">{timed ? `已做 ${idx} 题` : `${idx + 1}/${problems.length}`}</span>
      </div>

      {/* 题面 */}
      <div className="paper-card w-full max-w-md p-8 text-center">
        <button
          onClick={() => void speak(q.prompt)}
          className="mx-auto mb-3 w-14 h-14 rounded-full bg-pig-500 text-white shadow-lift active:scale-95 flex items-center justify-center text-2xl"
          aria-label="再听一遍"
        >
          🔊
        </button>
        <p className="text-6xl font-bold text-ink-900 tracking-wider mb-2">
          {twoStage && stage === 1 ? `${q.a} ÷ ${q.b} = ${q.ans} … ?` : q.expr}
        </p>
        {stageLabel && <p className="text-child text-ink-500">{stageLabel}</p>}
      </div>

      {/* 输入显示 */}
      <div className="w-full max-w-md mt-5 h-16 rounded-soft bg-white border-4 border-pig-200 flex items-center justify-center">
        <span className="text-5xl font-bold text-pig-600">{input || <span className="text-pig-200">?</span>}</span>
      </div>

      {/* 反馈 */}
      {feedback && (
        <div className={`w-full max-w-md mt-3 p-3 rounded-soft text-child font-bold text-center ${feedback.ok ? 'bg-grass-100 text-grass-700' : 'bg-chili-50 text-chili-600'}`}>
          {feedback.ok
            ? (twoStage && stage === 1 ? '✅ 商对了！再答余数' : '✅ 对啦')
            : `再想想，正确答案：${feedback.showAns}`}
        </div>
      )}

      {/* 9 键键盘 */}
      <div className="w-full max-w-md mt-4 grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
          <button
            key={n}
            onClick={() => { if (!feedback) setInput(s => (s.length < 2 ? s + n : s)) }}
            className="aspect-square bg-white rounded-2xl shadow-card text-4xl font-bold text-pig-600 active:scale-95 active:bg-pig-50"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setInput(s => s.slice(0, -1))}
          className="aspect-square bg-white rounded-2xl shadow-card text-3xl font-bold text-ink-500 active:scale-95"
        >
          ⌫
        </button>
        <button
          onClick={() => { if (!feedback) setInput(s => (s.length < 2 ? s + '0' : s)) }}
          className="aspect-square bg-white rounded-2xl shadow-card text-4xl font-bold text-pig-600 active:scale-95 active:bg-pig-50"
        >
          0
        </button>
        {feedback && !feedback.ok ? (
          <button onClick={next} className="aspect-square rounded-2xl bg-sun-500 text-white text-child font-bold shadow-card active:scale-95">
            继续
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!input || feedback?.ok === true}
            className="aspect-square rounded-2xl bg-grass-500 text-white text-child font-bold shadow-grass active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            ✓
          </button>
        )}
      </div>

      {streak >= 3 && !feedback && (
        <p className="mt-3 text-child font-bold text-sun-600">🔥 连对 {streak} 题！</p>
      )}
    </main>
  )
}
