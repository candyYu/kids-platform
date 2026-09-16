// 首页上的作业入口：一个紧凑横条，点进去才是完整作业板。
// 直接显示完成进度（x/y、全部完成），孩子在首页一眼知道今天作业做没做完，
// 又不会把 9 条作业全铺开占掉半屏（pad 上首页保持一屏不滚动）。
// 数据走 useHomework 的 30s 内存缓存，和作业页共用同一份拉取。
import { useMemo } from 'react'
import { useHomework, loadChecks, entryCheckKey } from './useHomework'
import { isHomeworkStarClaimed } from './reward'

export default function HomeworkEntry() {
  const { status, entries, fingerprint, reload } = useHomework()

  const { done, total } = useMemo(() => {
    const keys = entries.flatMap((e) => e.lines.map((l) => entryCheckKey(e.subject, l)))
    const checks = loadChecks()
    return { done: keys.filter((k) => checks[k]).length, total: keys.length }
  }, [entries])

  // 还没拉到 / 今天没有作业：不占位，首页保持干净
  if (status === 'loading' || status === 'empty') return null

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={reload}
        className="w-full max-w-2xl mx-auto mb-5 flex items-center gap-3 bg-white rounded-bubble shadow-card border-2 border-chili-500/30 px-4 py-3 text-left active:scale-[0.99]"
      >
        <span className="text-2xl">📋</span>
        <span className="flex-1 text-sm font-bold text-chili-500">作业暂时打不开，点我再试一次</span>
        <span className="text-chili-400">↻</span>
      </button>
    )
  }

  const allDone = total > 0 && done === total
  const pct = total ? Math.round((done / total) * 100) : 0
  const starDone = fingerprint ? isHomeworkStarClaimed(fingerprint) : false

  return (
    <a
      href="#/homework"
      className="w-full max-w-2xl mx-auto mb-5 block bg-white rounded-bubble shadow-card border-2 border-pig-200 px-4 py-3 active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{allDone ? '🎉' : '📋'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-extrabold text-pig-700 text-base sm:text-lg">今日作业</span>
            <span className={`text-xs sm:text-sm font-extrabold ${allDone ? 'text-grass-600' : 'text-pig-500'}`}>
              {allDone ? (starDone ? '全部完成 · ⭐已收下' : '全部完成！') : `${done}/${total} 完成`}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 bg-pig-50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                allDone ? 'bg-gradient-to-r from-grass-300 to-grass-500'
                        : 'bg-gradient-to-r from-sun-300 to-pig-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-pig-300 text-xl flex-none">›</span>
      </div>
    </a>
  )
}
