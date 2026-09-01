// 首页：两个大卡片（音乐 / 语文），点击进入对应应用
// 设计：佩奇风格 + 圆润无尖角 + 大色块 + 不需要文字输入
// 自适应布局：
//   < 640px (sm)：竖排堆叠（iPhone / 小屏手机）
//   >= 640px (sm)：横排并排（iPad / 平板 / 电脑）
//   >= 1024px (lg)：字号略大（iPad 横屏 / 桌面）

interface CardProps {
  href: string
  bg: string
  emoji: string  // 不引 SVG，太重；用 Unicode 装饰性 emoji
  title: string
  subtitle: string
  onClick?: () => void
}

function Card({ href, bg, emoji, title, subtitle }: CardProps) {
  return (
    <a
      href={href}
      className={`${bg} block rounded-bubble shadow-card p-6 sm:p-8 text-white active:scale-95 transition-transform`}
    >
      <div className="text-6xl sm:text-7xl lg:text-8xl mb-3 text-center">{emoji}</div>
      <div className="text-2xl sm:text-3xl font-bold text-center mb-1">{title}</div>
      <div className="text-sm sm:text-base text-center opacity-90">{subtitle}</div>
    </a>
  )
}

export default function Home() {
  // 本地 dev：music 在 5174，yuwen 在 5175
  // 部署到 Vercel：/music → music SPA, /yuwen → yuwen SPA（同源）
  const isDev = import.meta.env.DEV
  const musicHref = isDev ? 'http://127.0.0.1:5174' : '/music'
  const yuwenHref = isDev ? 'http://127.0.0.1:5175' : '/yuwen'

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-pig-50 p-4 sm:p-6 flex flex-col">
      <header className="text-center mb-6 sm:mb-8 mt-2 sm:mt-4">
        <div className="text-4xl sm:text-5xl mb-2">🌈</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-pig-700">宝宝学习乐园</h1>
        <p className="text-sm sm:text-base text-pig-500 mt-1">想学什么呀？</p>
      </header>

      {/* 核心响应式：竖排 → 横排 */}
      <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-md sm:max-w-3xl mx-auto w-full">
        <div className="flex-1">
          <Card
            href={musicHref}
            bg="bg-gradient-to-br from-purple-400 to-purple-600"
            emoji="🎵"
            title="小小音乐家"
            subtitle="听音 · 唱歌 · 视唱练耳"
          />
        </div>
        <div className="flex-1">
          <Card
            href={`${yuwenHref}?g=1`}
            bg="bg-gradient-to-br from-pig-400 to-pig-600"
            emoji="📖"
            title="一年级语文"
            subtitle="拼音 · 古诗 · 听写"
          />
        </div>
        <div className="flex-1">
          <Card
            href={`${yuwenHref}?g=2`}
            bg="bg-gradient-to-br from-sun-400 to-sun-600"
            emoji="📗"
            title="二年级语文"
            subtitle="课文朗读 · 认字"
          />
        </div>
      </div>

      <footer className="text-center text-xs text-pig-400 mt-6">
        v0.1 · 给宝宝的私人学习平台
      </footer>
    </main>
  )
}
