// 今日复习（艾宾浩斯）：到期单词逐个过——答对才放行，答错回炉明天再来
// 出题：有图的词=看图选词，文字词=听音选词；干扰项从全册词表抽
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UNITS, type EnWord } from '@/data/units'
import { speakEn } from '@/audio/tts'
import { due, reviewResult, addStars, touchStreak } from '@kids/core'

const ALL_WORDS: EnWord[] = UNITS.flatMap((u) => u.words)
const srsKey = (en: string) => `en:${en}`

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ReviewPage() {
  const [round, setRound] = useState(0)
  const items = useMemo(
    () =>
      due('en')
        .map((d) => ALL_WORDS.find((w) => srsKey(w.en) === d.key))
        .filter((w): w is EnWord => !!w),
    [round] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState('')
  const [done, setDone] = useState(false)
  const [audioMissed, setAudioMissed] = useState(false) // 播一遍没听清 → 可重听

  const w = items.length > 0 ? items[qi % items.length] : null
  // 注意：所有 hooks 必须在条件 return 之前（items 变空时 hook 数量不能变，否则 React 崩溃）
  const options = useMemo(
    () =>
      w
        ? shuffle([w, ...shuffle(ALL_WORDS.filter((x) => x.en !== w.en)).slice(0, 3)])
        : [],
    [w?.en, round, qi] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // 进页即打卡（复习也是学习行为；touchStreak 幂等）
  useEffect(() => {
    touchStreak()
  }, [])

  // 到期词为空：复习完了 / 还没学过
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-cream-100 p-6 text-center">
        <div className="text-6xl mt-16 mb-4">🌟</div>
        <h1 className="text-child-xl font-bold text-sky-700 mb-2">
          今天没有要复习的单词
        </h1>
        <p className="text-child text-ink-500 mb-8">
          去单元里点读新单词吧，学会的字明天会在这里等你复习
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 rounded-full bg-sky-500 text-white text-child font-bold shadow-sky active:scale-95"
        >
          回英语首页
        </Link>
      </main>
    )
  }

  const w2 = w! // 下方渲染处使用（items 非空时 w 一定存在）

  const pick = async (opt: EnWord) => {
    if (done) return
    if (opt.en === w2.en) {
      addStars(2) // 复习答对奖励更高：+2⭐
      reviewResult(srsKey(w2.en), true)
      setDone(true)
      setTimeout(() => {
        setDone(false)
        setWrong('')
        setAudioMissed(false)
        if (qi + 1 >= items.length) {
          setRound((r) => r + 1) // 全部复习完 → 重新查（应为空 → 显示完成页）
          setQi(0)
        } else {
          setQi((i) => i + 1)
        }
      }, 650)
    } else {
      reviewResult(srsKey(w2.en), false) // 答错回第 0 盒，明天再来
      setWrong(opt.en)
      setTimeout(() => setWrong(''), 450)
    }
  }

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
        <div>
          <h1 className="text-child-lg font-bold text-sky-700 leading-tight">🧠 今日复习</h1>
          <p className="text-xs text-ink-500">答对才能过关哦</p>
        </div>
      </div>

      {/* 进度 */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 h-3.5 bg-white border-2 border-sky-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full transition-all"
            style={{ width: `${((qi + (done ? 1 : 0)) / items.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-sky-600">
          {qi + (done ? 1 : 0)}/{items.length}
        </span>
      </div>

      {/* 题面 */}
      {w2.emoji ? (
        <div className="paper-card mx-auto flex flex-col items-center gap-1 px-10 py-5">
          <span className="text-7xl">{w2.emoji}</span>
          <span className="text-child font-bold text-ink-700">它叫什么？</span>
        </div>
      ) : (
        <button
          onClick={() => {
            touchStreak()
            speakEn(w2.en, 'word')
            setAudioMissed(true)
          }}
          className="paper-card mx-auto flex flex-col items-center gap-2 px-10 py-6 active:scale-95 tap-flash playing-ring"
        >
          <span className="text-6xl">🔊</span>
          <span className="text-child font-bold text-ink-700">听一听，选出这个词</span>
        </button>
      )}
      {audioMissed && (
        <p className="text-center text-xs text-sky-500 mt-2">没听清？再点一下喇叭重听 🔊</p>
      )}

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        {options.map((opt) => {
          const isRight = done && opt.en === w2.en
          const isWrong = wrong === opt.en
          return (
            <button
              key={opt.en}
              onClick={() => pick(opt)}
              className={`paper-card flex flex-col items-center justify-center py-4 active:scale-95 transition ${
                isRight ? 'border-grass-500 bg-grass-50 pop-in' : isWrong ? 'shake border-chili-500' : ''
              }`}
            >
              <span className="text-child-lg font-bold text-ink-900">{opt.en}</span>
            </button>
          )
        })}
      </div>

      {done && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-8xl pop-in">🎉</span>
        </div>
      )}
    </main>
  )
}
