// 首页顶部「今日作业」板块：从 OSS 拉取家长发布的当天作业，孩子逐条打勾。
// 打勾只存本机；语文条目挂摘星卡直达按钮（摘星卡页在 yuwen app）。
// 全部完成：⭐×1 计入全平台星星，全屏彩纸庆祝（同一份作业当天只奖一次）。
import { useMemo, useState } from 'react'
import {
  useHomework, loadChecks, toggleCheck, entryCheckKey,
} from './useHomework'
import { claimHomeworkStar, isHomeworkStarClaimed } from './reward'
import CelebrationOverlay from './CelebrationOverlay'
import type { Subject } from './parser'

const SUBJECT_META: Record<Subject, { emoji: string; bg: string }> = {
  语文: { emoji: '📖', bg: 'bg-pig-50 border-pig-100' },
  数学: { emoji: '🔢', bg: 'bg-[#F1FBE7] border-grass-100' },
  英语: { emoji: '🔤', bg: 'bg-sea-50 border-sea-100' },
  小提琴: { emoji: '🎻', bg: 'bg-sun-50 border-sun-100' },
}

function starCardUrl(lesson: number): string {
  // 摘星卡页按卡的课次（1-14）路由，yuwen app 内部自己做 id 映射（第9课→L08Y）
  // yuwen vite base=/yuwen/，dev 下也必须带前缀，否则命中 vite base 提示页
  return import.meta.env.DEV
    ? `http://localhost:5175/yuwen/star-cards/${lesson}`
    : `/yuwen/star-cards/${lesson}`
}

function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  // key 随 checked 变：每次新勾上都重播一次小弹跳
  return (
    <button
      onClick={onToggle}
      aria-label={checked ? '取消完成' : '标记完成'}
      className={`flex-none w-9 h-9 sm:w-10 sm:h-10 rounded-full border-[3px] flex items-center justify-center text-xl font-bold transition-all active:scale-90 ${
        checked
          ? 'bg-grass-400 border-grass-500 text-white'
          : 'bg-white border-pig-200 text-transparent'
      }`}
    >
      {checked && (
        <span key="pop" className="hw-check-pop leading-none">✓</span>
      )}
    </button>
  )
}

export default function HomeworkBoard({ showTitle = true }: { showTitle?: boolean }) {
  const { status, entries, orphans, staleNote, fingerprint, reload } = useHomework()
  const [checksVersion, setChecksVersion] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  void checksVersion

  const checks = loadChecks()
  const allKeys = useMemo(
    () => entries.flatMap((e) => e.lines.map((l) => entryCheckKey(e.subject, l))),
    [entries],
  )
  const doneCount = allKeys.filter((k) => checks[k]).length
  const total = allKeys.length
  const allDone = total > 0 && doneCount === total
  const starClaimed = fingerprint ? isHomeworkStarClaimed(fingerprint) : true

  if (status === 'loading') {
    return (
      <section className="w-full max-w-2xl mx-auto mb-5">
        <div className="bg-white/70 rounded-bubble shadow-card p-4 text-center text-pig-400 text-sm">
          正在取今天的作业…
        </div>
      </section>
    )
  }

  if (status === 'empty') return null // 没有作业时不占地方，首页保持干净

  if (status === 'error') {
    return (
      <section className="w-full max-w-2xl mx-auto mb-5">
        <div className="bg-white rounded-bubble shadow-card border-2 border-chili-500/30 p-4 text-center">
          <p className="text-chili-500 font-bold text-sm mb-2">作业暂时打不开，问问妈妈 🤔</p>
          <button
            onClick={reload}
            className="text-xs bg-pig-100 text-pig-600 px-3 py-1.5 rounded-full font-bold active:scale-95"
          >
            再试一次
          </button>
        </div>
      </section>
    )
  }

  const onToggle = (key: string) => {
    const willCheck = !checks[key]
    toggleCheck(key, willCheck)
    setChecksVersion((v) => v + 1)

    if (willCheck) {
      // 直接从 localStorage 读最新勾选数（防快速连点时 state 还没刷新漏发奖）；
      // 这一勾之后全部完成，且这份作业今天还没领过星 → 发奖 + 庆祝
      const latest = loadChecks()
      const nextDone = allKeys.filter((k) => latest[k]).length
      if (nextDone === total && !isHomeworkStarClaimed(fingerprint)) {
        const gained = claimHomeworkStar(fingerprint)
        if (gained > 0) setCelebrating(true)
      }
    }
  }

  const progressPct = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <section className="w-full max-w-2xl mx-auto mb-5">
      <div className={`flex items-center justify-between mb-2 ${showTitle ? 'px-1' : ''}`}>
        {showTitle && <h2 className="text-lg sm:text-xl font-bold text-pig-700">📋 今天的作业</h2>}
        {!showTitle && <span className="flex-1" />}
        <span className={`inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full border ${
          allDone
            ? 'text-grass-700 bg-grass-50 border-grass-200'
            : 'text-pig-500 bg-white/80 border-pig-100'
        }`}>
          {allDone
            ? (starClaimed ? '🎉 全部完成 · ⭐已收下' : '🎉 全部完成')
            : `完成 ${doneCount}/${total}`}
        </span>
      </div>

      {/* 总进度条 */}
      <div className="h-3 bg-white/80 rounded-full border border-pig-100 overflow-hidden mb-3 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sun-300 via-pig-400 to-pig-500 transition-[width] duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {staleNote && (
        <p className="text-[11px] text-chili-500/80 mb-2 px-1">⚠️ {staleNote}</p>
      )}

      <div className="space-y-3">
        {entries.map((entry) => {
          const meta = SUBJECT_META[entry.subject]
          const keys = entry.lines.map((l) => entryCheckKey(entry.subject, l))
          const subDone = keys.filter((k) => checks[k]).length
          const subjectDone = subDone === keys.length
          return (
            <div
              key={entry.subject}
              className={`rounded-bubble shadow-card border-2 p-3 sm:p-4 transition-opacity duration-500 ${meta.bg} ${
                subjectDone ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{meta.emoji}</span>
                <span className="font-bold text-ink-700">{entry.subject}</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  subjectDone ? 'bg-grass-100 text-grass-700' : 'bg-white/70 text-ink-400'
                }`}>
                  {subjectDone ? '✓ 完成' : `${subDone}/${keys.length}`}
                </span>
                {entry.starCardLesson != null && (
                  <a
                    href={starCardUrl(entry.starCardLesson)}
                    className="ml-auto text-xs sm:text-sm font-bold text-white bg-pig-500 px-3 py-1.5 rounded-full active:scale-95 shadow"
                  >
                    🎴 摘星卡第{entry.starCardLesson}课
                  </a>
                )}
              </div>
              <ul className="space-y-2">
                {entry.lines.map((line) => {
                  const key = entryCheckKey(entry.subject, line)
                  const checked = !!checks[key]
                  return (
                    <li key={key} className="flex items-center gap-3">
                      <Checkbox checked={checked} onToggle={() => onToggle(key)} />
                      <span
                        className={`text-sm sm:text-base leading-snug transition-all ${
                          checked ? 'line-through text-ink-400' : 'text-ink-700'
                        }`}
                      >
                        {line}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>

      {orphans > 0 && (
        <p className="text-[11px] text-chili-500/70 mt-2 px-1">
          作业文件有 {orphans} 行没写学科，告诉妈妈检查一下～
        </p>
      )}

      {celebrating && <CelebrationOverlay onClose={() => setCelebrating(false)} />}
    </section>
  )
}
