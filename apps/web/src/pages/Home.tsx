// 首页：学科平级入口（语文 / 音乐已上线；数学 / 英语 敬请期待占位）
// 年级选择收在语文应用内部（HomePage 顶部的年级切换，localStorage 记住上次年级）
// 设计：佩奇风格 + 圆润无尖角 + 大色块 + 不需要文字输入
// 自适应布局：
//   < 640px：2×2 网格（手机）
//   >= 640px：2×2 网格略大（平板 / 电脑）

interface CardProps {
  href?: string  // 无 href = 敬请期待占位（不可点）
  bg: string
  emoji: string
  title: string
  subtitle: string
}

function Card({ href, bg, emoji, title, subtitle }: CardProps) {
  const cls = `${bg} block rounded-bubble shadow-card p-6 sm:p-8 text-white active:scale-95 transition-transform text-center`
  const inner = (
    <>
      <div className="text-6xl sm:text-7xl mb-3">{emoji}</div>
      <div className="text-2xl sm:text-3xl font-bold mb-1">{title}</div>
      <div className="text-sm sm:text-base opacity-90">{subtitle}</div>
    </>
  )
  if (href) return <a href={href} className={cls}>{inner}</a>
  // 占位卡：去饱和 + 半透明，表达"还没开学"
  return <div className={`${cls} opacity-50 saturate-50 cursor-default`}>{inner}</div>
}

export default function Home() {
  // 本地 dev：music 在 5174，yuwen 在 5175，math 在 5176
  // 部署到 GitHub Pages：/music → music SPA, /yuwen → yuwen SPA, /math → math SPA（同源）
  const isDev = import.meta.env.DEV
  const musicHref = isDev ? 'http://127.0.0.1:5174' : '/music'
  const yuwenHref = isDev ? 'http://127.0.0.1:5175' : '/yuwen'
  const mathHref = isDev ? 'http://127.0.0.1:5176' : '/math'

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-pig-50 p-4 sm:p-6 flex flex-col">
      <header className="text-center mb-6 sm:mb-8 mt-2 sm:mt-4">
        <div className="text-4xl sm:text-5xl mb-2">🌈</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-pig-700">宝宝学习乐园</h1>
        <p className="text-sm sm:text-base text-pig-500 mt-1">想学什么呀？</p>
      </header>

      {/* 学科平级 2×2 */}
      <div className="flex-1 grid grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto w-full content-center">
        <Card
          href={yuwenHref}
          bg="bg-gradient-to-br from-pig-400 to-pig-600"
          emoji="📖"
          title="小小语文家"
          subtitle="拼音 · 课文 · 古诗"
        />
        <Card
          href={musicHref}
          bg="bg-gradient-to-br from-purple-400 to-purple-600"
          emoji="🎵"
          title="小小音乐家"
          subtitle="听音 · 唱歌 · 视唱练耳"
        />
        <Card
          href={mathHref}
          bg="bg-gradient-to-br from-grass-400 to-grass-600"
          emoji="🔢"
          title="小小数学家"
          subtitle="口算 · 闯关 · 错题本"
        />
        <Card
          bg="bg-gradient-to-br from-sun-300 to-sun-400"
          emoji="🔤"
          title="小小英语家"
          subtitle="敬请期待"
        />
      </div>

      <footer className="text-center text-xs text-pig-400 mt-6">
        v0.1 · 给宝宝的私人学习平台
      </footer>
    </main>
  )
}
