// 单元页：学单词（点读）→ 学句子（点读）→ 练一练（听音选图/看图选词/听音选词）
// 课本活动对应：Look, listen and chant（点读）+ Listen and do / Let's play（练一练）
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { unitById, type EnWord, type EnUnit } from '@/data/units'
import { speakEn } from '@/audio/tts'

type Stage = 'words' | 'sents' | 'quiz'

// ---------------- 学单词 ----------------
function WordGrid({ unit }: { unit: EnUnit }) {
  const [playing, setPlaying] = useState('')
  const tap = async (w: EnWord) => {
    setPlaying(w.en)
    await speakEn(w.en, 'word')
    setTimeout(() => setPlaying((p) => (p === w.en ? '' : p)), 600)
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {unit.words.map((w) => (
        <button
          key={w.en}
          onClick={() => tap(w)}
          className={`paper-card flex flex-col items-center justify-center py-4 px-2 active:scale-95 transition tap-flash ${
            playing === w.en ? 'playing-ring' : ''
          }`}
        >
          {w.emoji ? (
            <span className="text-5xl leading-none mb-1">{w.emoji}</span>
          ) : (
            <span className="text-3xl leading-none mb-1 font-extrabold text-sky-500">🔤</span>
          )}
          <span className="text-child-lg font-bold text-ink-900">{w.en}</span>
          <span className="text-sm text-ink-500">{w.zh}</span>
          <span className="text-xs mt-1">🔊 点我读</span>
        </button>
      ))}
    </div>
  )
}

// ---------------- 学句子 ----------------
function SentList({ unit }: { unit: EnUnit }) {
  const [playing, setPlaying] = useState('')
  const tap = async (en: string) => {
    setPlaying(en)
    await speakEn(en, 'sent')
    setTimeout(() => setPlaying((p) => (p === en ? '' : p)), 600)
  }
  return (
    <div className="flex flex-col gap-2.5">
      {unit.sentences.map((s) => (
        <button
          key={s.en}
          onClick={() => tap(s.en)}
          className={`paper-card flex items-center gap-3 px-4 py-3.5 text-left active:scale-[0.98] transition tap-flash ${
            playing === s.en ? 'playing-ring' : ''
          }`}
        >
          <span className="text-2xl shrink-0">🔊</span>
          <span className="min-w-0">
            <span className="block text-child-lg font-bold text-ink-900 leading-snug">{s.en}</span>
            <span className="block text-sm text-ink-500 mt-0.5">{s.zh}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

// ---------------- 练一练 ----------------
type QKind = 'listen-pick-img' | 'see-img-pick-word' | 'listen-pick-word'
interface Question {
  kind: QKind
  target: EnWord
  options: EnWord[] // 含 target，顺序已打乱
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(unit: EnUnit): Question[] {
  const pool = unit.words
  if (pool.length < 4) return []
  const picWords = pool.filter((w) => w.emoji)
  const qs: Question[] = []
  for (const w of picWords) {
    // 听音选图（干扰项也从图词里选，避免"看字猜"）
    const imgPool = picWords.filter((x) => x.en !== w.en)
    if (imgPool.length >= 3) {
      qs.push({ kind: 'listen-pick-img', target: w, options: shuffle([w, ...shuffle(imgPool).slice(0, 3)]) })
    }
    // 看图选词
    qs.push({ kind: 'see-img-pick-word', target: w, options: shuffle([w, ...shuffle(pool.filter((x) => x.en !== w.en)).slice(0, 3)]) })
  }
  // 文字词：听音选词
  for (const w of pool.filter((x) => !x.emoji)) {
    qs.push({ kind: 'listen-pick-word', target: w, options: shuffle([w, ...shuffle(pool.filter((x) => x.en !== w.en)).slice(0, 3)]) })
  }
  return shuffle(qs)
}

function Quiz({ unit, onExit }: { unit: EnUnit; onExit: () => void }) {
  const [round, setRound] = useState(0) // 重开一轮
  const questions = useMemo(() => buildQuestions(unit), [unit, round])
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState('')
  const [done, setDone] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="paper-card p-6 text-center text-child text-ink-500">
        这个单元以句子为主，先去「学句子」点读吧！
        <button onClick={onExit} className="block mx-auto mt-4 px-6 py-2.5 rounded-full bg-sky-500 text-white font-bold active:scale-95">
          去学句子
        </button>
      </div>
    )
  }

  const q = questions[qi]

  const pick = async (w: EnWord) => {
    if (done) return
    if (w.en === q.target.en) {
      setDone(true) // 本题完成，庆祝后下一题
      setTimeout(() => {
        setDone(false)
        setWrong('')
        if (qi + 1 >= questions.length) {
          setRound((r) => r + 1)
          setQi(0)
        } else {
          setQi((i) => i + 1)
        }
      }, 650)
    } else {
      setWrong(w.en)
      setTimeout(() => setWrong(''), 450)
    }
  }

  const prompt =
    q.kind === 'listen-pick-img' ? (
      <button
        onClick={() => speakEn(q.target.en, 'word')}
        className="paper-card mx-auto flex flex-col items-center gap-2 px-10 py-6 active:scale-95 tap-flash playing-ring"
      >
        <span className="text-6xl">🔊</span>
        <span className="text-child font-bold text-ink-700">听一听，选出它</span>
      </button>
    ) : q.kind === 'see-img-pick-word' ? (
      <div className="paper-card mx-auto flex flex-col items-center gap-1 px-10 py-5">
        <span className="text-7xl">{q.target.emoji}</span>
        <span className="text-child font-bold text-ink-700">它叫什么？</span>
      </div>
    ) : (
      <button
        onClick={() => speakEn(q.target.en, 'word')}
        className="paper-card mx-auto flex flex-col items-center gap-2 px-10 py-6 active:scale-95 tap-flash playing-ring"
      >
        <span className="text-6xl">🔊</span>
        <span className="text-child font-bold text-ink-700">听一听，选出这个词</span>
      </button>
    )

  return (
    <div>
      {/* 进度 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-3.5 bg-white border-2 border-sky-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all"
            style={{ width: `${((qi + (done ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-sky-600">
          {qi + (done ? 1 : 0)}/{questions.length}
        </span>
      </div>

      {prompt}

      <div className="grid grid-cols-2 gap-3 mt-5">
        {q.options.map((w) => {
          const isRight = done && w.en === q.target.en
          const isWrong = wrong === w.en
          return (
            <button
              key={w.en}
              onClick={() => pick(w)}
              className={`paper-card flex flex-col items-center justify-center py-4 active:scale-95 transition ${
                isRight ? 'border-grass-500 bg-grass-50 pop-in' : isWrong ? 'shake border-chili-500' : ''
              }`}
            >
              {q.kind === 'listen-pick-word' ? (
                <span className="text-child-lg font-bold text-ink-900">{w.en}</span>
              ) : q.kind === 'listen-pick-img' ? (
                <span className="text-5xl leading-none mb-1">{w.emoji}</span>
              ) : (
                <span className="text-child-lg font-bold text-ink-900">{w.en}</span>
              )}
            </button>
          )
        })}
      </div>

      {done && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-8xl pop-in">🎉</span>
        </div>
      )}

      {/* 一轮答完自动重开（round++），底部小字提示 */}
      <p className="text-center text-xs text-ink-500 mt-4">答完一轮会自动再来一轮，玩到不想玩为止</p>
    </div>
  )
}

// ---------------- 单元页外壳 ----------------
export default function UnitPage() {
  const { unitId = '' } = useParams()
  const unit = unitById(unitId)
  const [stage, setStage] = useState<Stage>(unit && unit.words.length > 0 ? 'words' : 'sents')

  if (!unit) {
    return (
      <main className="min-h-screen bg-cream-50 p-6 text-center">
        <p className="text-child text-ink-700 mt-10">找不到这个单元</p>
        <Link to="/" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-sky-500 text-white font-bold">
          回英语首页
        </Link>
      </main>
    )
  }

  const hasWords = unit.words.length > 0

  const allTabs: { key: Stage; label: string; emoji: string }[] = [
    { key: 'words', label: '学单词', emoji: '🔤' },
    { key: 'sents', label: '学句子', emoji: '💬' },
    { key: 'quiz', label: '练一练', emoji: '🎯' },
  ]
  const tabs = allTabs.filter((t) => (t.key === 'words' || t.key === 'quiz') ? hasWords : true)

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-cream-100 p-5 pb-12">
      {/* 顶栏 */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/"
          className="w-11 h-11 shrink-0 flex items-center justify-center text-2xl bg-white border-2 border-sky-200 rounded-full active:scale-95"
          aria-label="返回"
        >
          ←
        </Link>
        <div className="min-w-0">
          <h1 className="text-child-lg font-bold text-sky-700 leading-tight truncate">
            {unit.emoji} {unit.label}
            {unit.title ? ` ${unit.title}` : ''} · {unit.titleZh}
          </h1>
          <p className="text-xs text-ink-500">点一点，听一听，跟着读</p>
        </div>
      </div>

      {/* 阶段切换 */}
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStage(t.key)}
            className={`flex-1 py-2.5 rounded-full text-child font-bold border-2 active:scale-95 transition ${
              stage === t.key
                ? 'bg-sky-500 text-white border-sky-500 shadow-sky'
                : 'bg-white text-sky-600 border-sky-200'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {stage === 'words' && <WordGrid unit={unit} />}
      {stage === 'sents' && <SentList unit={unit} />}
      {stage === 'quiz' && <Quiz unit={unit} onExit={() => setStage('sents')} />}
    </main>
  )
}
