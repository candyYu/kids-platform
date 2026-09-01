// 首页（按 ?g=1/2 年级显示对应内容的"继续学习"）
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, ensureDefaults, ensureLessons } from '@/db/schema'
import { updateStreak } from '@/utils/badges'
import { activeLessons, GRADE_LABEL } from '@/data'

export default function HomePage() {
  const lessons = activeLessons()
  const recs = useLiveQuery(() => db.lessons.toArray(), []) || []
  const errorCount = useLiveQuery(() => db.errorItems.count(), []) || 0
  const badgeCount = useLiveQuery(() => db.badges.count(), []) || 0

  useEffect(() => {
    void (async () => {
      await ensureDefaults()
      await ensureLessons()
      await updateStreak()
    })()
  }, [])

  const recOf = (id: string) => recs.find(r => r.id === id)
  const nextLesson = lessons.find(l => {
    const rec = recOf(l.id)
    return rec ? rec.unlocked === 1 && rec.stars === 0 : false
  }) ?? lessons[0]

  const streak = useLiveQuery(() => db.streak.get('singleton'), [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-6 flex flex-col">
      <div className="flex justify-end -mt-2 mb-2 gap-2">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-xs font-bold text-pig-500 bg-white/70 border border-pig-200 px-3 py-1.5 rounded-full active:scale-95">
          👩‍🏫 老师
        </Link>
        <a href="/" className="inline-flex items-center gap-1 text-xs font-bold text-pig-500 bg-white/70 border border-pig-200 px-3 py-1.5 rounded-full active:scale-95">
          🏠 回首页
        </a>
      </div>
      <header className="text-center mt-6 mb-8">
        <h1 className="text-child-xl font-bold text-pig-700 mb-2">
          小小语文家
        </h1>
        <p className="text-child text-sea-900/70">{GRADE_LABEL} · {lessons.some(l => l.kind === 'pinyin') ? '拼音闯关' : '课文朗读'} · 一起出发吧</p>
      </header>

      {/* 连续打卡 */}
      {streak && streak.current > 0 && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-sm text-sea-900 font-bold">
            🔥 已连续 {streak.current} 天
          </span>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {nextLesson && (
          <Link
            to={`/lesson/${nextLesson.id}`}
            className="block bg-pig-500 text-white p-6 rounded-bubble shadow-bubble active:scale-95"
          >
            <p className="text-sm opacity-90">继续学习</p>
            <p className="text-child-lg font-bold mt-1">{nextLesson.code} · {nextLesson.name}</p>
            <p className="text-sm opacity-80 mt-1">{nextLesson.theme}</p>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/map"
            className="bg-white text-sea-900 p-4 rounded-bubble shadow border-2 border-pig-200 active:scale-95"
          >
            <p className="text-3xl mb-1">🗺️</p>
            <p className="text-child font-bold">课程地图</p>
          </Link>
          <Link
            to="/cheatsheet"
            className="bg-white text-sun-700 p-4 rounded-bubble shadow border-2 border-sun-300 active:scale-95"
          >
            <p className="text-3xl mb-1">📒</p>
            <p className="text-child font-bold">知识闪卡</p>
          </Link>
          <Link
            to="/errorbook"
            className="bg-white text-sea-900 p-4 rounded-bubble shadow border-2 border-pig-200 active:scale-95 relative"
          >
            <p className="text-3xl mb-1">📒</p>
            <p className="text-child font-bold">错题本</p>
            {errorCount > 0 && (
              <span className="absolute top-2 right-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {errorCount}
              </span>
            )}
          </Link>
          {lessons.some(l => l.kind === 'pinyin') && (
            <Link
              to="/review"
              className="bg-white text-sun-700 p-4 rounded-bubble shadow border-2 border-sun-300 active:scale-95"
            >
              <p className="text-3xl mb-1">🎪</p>
              <p className="text-child font-bold">复习闯关</p>
            </Link>
          )}
          <Link
            to={`/parent?pin=0000`}
            className="bg-white text-gray-700 p-4 rounded-bubble shadow border-2 border-gray-200 active:scale-95"
          >
            <p className="text-3xl mb-1">👨‍👩‍👧</p>
            <p className="text-child font-bold">家长</p>
            {badgeCount > 0 && (
              <span className="text-xs text-gray-500 mt-1 block">🏅 {badgeCount}</span>
            )}
          </Link>
          <Link
            to="/poem"
            className="bg-white text-pig-700 p-4 rounded-bubble shadow border-2 border-pig-300 active:scale-95"
          >
            <p className="text-3xl mb-1">📜</p>
            <p className="text-child font-bold">古诗</p>
            <p className="text-xs text-pig-400 mt-0.5">带拼音 · 听读</p>
          </Link>
        </div>
      </div>

      <footer className="text-center mt-8 text-sm text-sea-900/40">
        小小语文家 · v0.1
      </footer>
    </main>
  )
}
