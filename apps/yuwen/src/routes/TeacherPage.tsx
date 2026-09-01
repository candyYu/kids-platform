// 老师页：修订课文正文（覆盖存 localStorage，ReadingLesson 优先读取）
// 入口：/teacher ；只列当前年级有正文的课
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACTIVE_GRADE, LESSONS_BY_GRADE, TEXTS_BY_GRADE } from '@/data'

export default function TeacherPage() {
  const lessons = LESSONS_BY_GRADE[ACTIVE_GRADE].filter(l => l.textId)
  const [currentId, setCurrentId] = useState(lessons[0]?.textId ?? '')
  const [saved, setSaved] = useState(false)

  const current = useMemo(
    () => lessons.find(l => l.textId === currentId),
    [lessons, currentId],
  )
  const original = current?.textId ? TEXTS_BY_GRADE[ACTIVE_GRADE][current.textId] : undefined

  const [draft, setDraft] = useState<string>('')
  const [loadedFor, setLoadedFor] = useState<string>('')

  // 切课时加载当前生效文本（覆盖 > 原始）
  if (current?.textId && loadedFor !== current.textId) {
    let lines = original?.lines ?? []
    try {
      const raw = localStorage.getItem(`teacher-override-${ACTIVE_GRADE}-${current.textId}`)
      if (raw) lines = JSON.parse(raw) as string[]
    } catch { /* 用原始 */ }
    setDraft(lines.join('\n'))
    setLoadedFor(current.textId)
    setSaved(false)
  }

  function save() {
    if (!current?.textId) return
    const lines = draft.split('\n').filter(l => l.trim() !== '')
    localStorage.setItem(`teacher-override-${ACTIVE_GRADE}-${current.textId}`, JSON.stringify(lines))
    setSaved(true)
  }

  function reset() {
    if (!current?.textId) return
    localStorage.removeItem(`teacher-override-${ACTIVE_GRADE}-${current.textId}`)
    setDraft((original?.lines ?? []).join('\n'))
    setSaved(false)
  }

  return (
    <main className="min-h-screen bg-cream-50 p-4 max-w-2xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <Link to="/map" className="text-pig-700 text-2xl">←</Link>
        <h1 className="text-child font-bold text-sea-900">老师修订页（{ACTIVE_GRADE === '2' ? '二年级' : '一年级'}）</h1>
        <span />
      </header>

      <select
        value={currentId}
        onChange={e => setCurrentId(e.target.value)}
        className="w-full p-3 rounded-soft border-2 border-pig-200 bg-white font-bold text-sea-900 mb-3"
      >
        {lessons.map(l => (
          <option key={l.textId} value={l.textId!}>{l.code} · {l.name}</option>
        ))}
      </select>

      <p className="text-xs text-pig-500 mb-2">每行一句。保存后孩子端立即生效（本机浏览器）。</p>
      <textarea
        value={draft}
        onChange={e => { setDraft(e.target.value); setSaved(false) }}
        rows={16}
        className="w-full p-3 rounded-soft border-2 border-pig-200 bg-white text-child leading-relaxed"
      />
      <div className="flex gap-3 mt-3">
        <button onClick={save} className="flex-1 bg-pig-500 text-white rounded-bubble p-4 font-bold active:scale-95">
          {saved ? '✓ 已保存' : '保存'}
        </button>
        <button onClick={reset} className="px-6 bg-white border-2 border-pig-200 text-pig-700 rounded-bubble font-bold active:scale-95">
          还原
        </button>
      </div>
    </main>
  )
}
