// 独立作业页：从首页入口进来。顶部回首页 + 完整作业板（进度条/打勾/庆祝都在板内）。
import HomeworkBoard from '../homework/HomeworkBoard'

export default function HomeworkPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-pig-50 pt-4 pb-10 px-4 sm:px-6">
      <header className="max-w-2xl mx-auto flex items-center gap-2 mb-4">
        <a
          href="#"
          className="text-sm font-bold text-pig-500 bg-white border border-pig-200 rounded-full px-3 py-1.5 shadow-sm active:scale-95"
        >
          ← 回首页
        </a>
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-xl font-bold text-pig-700">📋 今天的作业</h1>
        </div>
        <span className="w-[76px]" />
      </header>
      <HomeworkBoard showTitle={false} />
    </main>
  )
}
