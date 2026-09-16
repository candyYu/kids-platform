// 单张摘星卡：看卡面内容、听家长录的整卡真人录音、家长自评（☆/🔴、三档熟练程度）。
// 不做逐词机器发音——教师明确不要合成音，示范以真人录音为准。
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cardByLesson, flatReadableItems } from '@/data/starCards'
import { starCardAudioUrl } from './oss'
import StarItemRow from './StarItemRow'
import {
  useProgress, getCard, cycleMark, setRating, markCounts,
  itemKey, type CardRating,
} from './progress'

const RATINGS: { v: CardRating; label: string; cls: string }[] = [
  { v: 'proficient', label: '😄 熟练', cls: 'bg-grass-400 border-grass-500 text-white' },
  { v: 'familiar', label: '🙂 比较熟练', cls: 'bg-sun-400 border-sun-500 text-white' },
  { v: 'practice', label: '💪 加油', cls: 'bg-pig-400 border-pig-500 text-white' },
]

export default function StarCardPage() {
  const { lessonParam } = useParams()
  const lesson = Number(lessonParam)
  const card = Number.isFinite(lesson) ? cardByLesson(lesson) : undefined
  const progressMap = useProgress()
  const [teacherPlaying, setTeacherPlaying] = useState(false)
  const [teacherError, setTeacherError] = useState(false)
  const teacherAudioRef = useRef<HTMLAudioElement | null>(null)

  const totalItems = useMemo(() => (card ? flatReadableItems(card).length : 0), [card])

  // 换卡/离开：停掉真人录音，旧 audio 元素随 src 重建
  useEffect(() => {
    return () => {
      teacherAudioRef.current?.pause()
      teacherAudioRef.current = null
    }
  }, [card?.lesson])

  if (!card) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pig-50 to-sun-50 p-6">
        <div className="max-w-md mx-auto text-center mt-20">
          <p className="text-xl font-bold text-pig-700 mb-4">没有这张摘星卡 🤔</p>
          <Link to="/star-cards" className="text-pig-500 font-bold underline">回摘星卡列表</Link>
        </div>
      </main>
    )
  }

  const prog = progressMap[card.lesson] || getCard(card.lesson)
  const counts = markCounts(prog)

  const stopTeacher = () => {
    const a = teacherAudioRef.current
    if (a) {
      a.pause()
      a.currentTime = 0
    }
    setTeacherPlaying(false)
  }

  const toggleTeacher = () => {
    if (teacherPlaying) { stopTeacher(); return }
    setTeacherError(false)
    let a = teacherAudioRef.current
    if (!a) {
      a = new Audio(starCardAudioUrl(card.lesson))
      a.addEventListener('ended', () => setTeacherPlaying(false))
      a.addEventListener('error', () => {
        setTeacherPlaying(false)
        setTeacherError(true)
      })
      teacherAudioRef.current = a
    }
    void a.play().then(() => setTeacherPlaying(true)).catch(() => {
      setTeacherPlaying(false)
      setTeacherError(true)
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pig-50 via-orange-50 to-sun-50 pb-16">
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b-2 border-pig-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <Link to="/star-cards" className="text-sm font-bold text-pig-500 bg-pig-50 border border-pig-200 rounded-full px-3 py-1.5 active:scale-95">
            ← 卡片列表
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-bold text-pig-700">
              第{card.lesson}课 · {card.title}
            </h1>
            <p className="text-[11px] text-ink-400">
              满☆ {card.totalStars ?? '—'} · 我已得 ⭐{counts.star}
              {counts.wrong > 0 && <span className="text-chili-500"> · 🔴 {counts.wrong} 待练</span>}
            </p>
          </div>
          <a href="/" className="text-sm font-bold text-pig-500 bg-white border border-pig-200 rounded-full px-3 py-1.5 active:scale-95">🏠</a>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        <button
          type="button"
          onClick={toggleTeacher}
          className={`w-full rounded-2xl py-4 text-lg font-bold shadow active:scale-[0.98] border-2 ${
            teacherPlaying
              ? 'bg-chili-500 text-white border-chili-500'
              : 'bg-pig-500 text-white border-pig-600'
          }`}
        >
          {teacherPlaying ? '⏹ 停止' : '🎧 听妈妈读整张卡'}
        </button>
        <Link
          to={`/lesson/${card.id}`}
          className="block text-center rounded-full py-2.5 font-bold text-pig-600 bg-pig-50 border-2 border-pig-200 active:scale-95 text-sm"
        >
          去这课闯关 →
        </Link>
        {teacherError && (
          <p className="text-[11px] text-chili-500 text-center">
            妈妈的录音暂时打不开，告诉妈妈检查一下～
          </p>
        )}

        {card.sections.map((section, si) => (
          <section key={si} className="bg-white/80 rounded-3xl shadow-card border-2 border-pig-100 p-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-bold text-ink-700">{section.name}</h2>
              {section.declaredStars != null && (
                <span className="text-xs font-bold text-sun-700 bg-sun-50 border border-sun-200 rounded-full px-2 py-0.5">
                  共 {section.declaredStars} ☆
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {section.items.map((item, ii) => {
                const key = itemKey(si, ii)
                return (
                  <StarItemRow
                    key={key}
                    item={item}
                    mark={prog.marks[key]}
                    onMark={() => cycleMark(card.lesson, key)}
                  />
                )
              })}
            </ul>
          </section>
        ))}

        {card.notes.length > 0 && (
          <section className="bg-sea-50/70 rounded-3xl border border-sea-100 p-4">
            <h2 className="font-bold text-sea-900 text-sm mb-1">小任务（不用点读）</h2>
            <ul className="space-y-1">
              {card.notes.map((n, i) => (
                <li key={i} className="text-sm text-sea-900/80">{n}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-white/80 rounded-3xl shadow-card border-2 border-sun-100 p-4">
          <h2 className="font-bold text-ink-700 mb-3">今天读得怎么样？（妈妈评）</h2>
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map(r => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRating(card.lesson, r.v)}
                className={`rounded-2xl border-2 py-3 text-sm font-bold active:scale-95 ${
                  prog.rating === r.v ? r.cls : 'bg-white border-sun-200 text-ink-500'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-400 mt-2 text-center">
            ⭐=会读　🔴=读错（点条目前面的 ☆ 小圈标记，共 {totalItems} 条），只存在这台 pad 上
          </p>
        </section>
      </div>
    </main>
  )
}
