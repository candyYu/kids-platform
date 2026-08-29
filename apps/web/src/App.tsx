import { useState } from 'react'
import Home from './pages/Home'
import { isUnlocked, setUnlocked } from './auth/gate'

// 密码页：6 位数字密码，存 localStorage（7 天有效）+ sessionStorage（当前标签页）
// 默认密码 '000000'，部署时在 GitHub Actions / Vercel 后台改 VITE_KIDS_PASSWORD 环境变量
// 6 岁孩子不输入，用 9 键大键盘点击

const PASSWORD = import.meta.env.VITE_KIDS_PASSWORD || '000000'

export default function App() {
  const [unlocked, setUnlockedState] = useState<boolean>(() => isUnlocked())
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <Home />

  const press = (n: string) => {
    if (input.length >= 6) return
    const next = input + n
    setInput(next)
    setError(false)
    if (next.length === 6) {
      // 6 位输完，校验
      setTimeout(() => {
        if (next === PASSWORD) {
          setUnlocked()
          setUnlockedState(true)
        } else {
          setError(true)
          setTimeout(() => setInput(''), 600)
        }
      }, 100)
    }
  }

  const back = () => {
    setInput(input.slice(0, -1))
    setError(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-pig-50 p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="text-center mb-4 sm:mb-6">
        <div className="text-5xl sm:text-6xl mb-2">🔒</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-pig-700">先输密码</h1>
        <p className="text-xs sm:text-sm text-pig-500 mt-1">家长设置的 6 位数字</p>
      </div>

      {/* 6 个圆点显示已输入 */}
      <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
              error
                ? 'bg-chili-500'
                : input.length > i
                ? 'bg-pig-500'
                : 'bg-pig-100'
            }`}
          />
        ))}
      </div>

      {/* 9 键键盘 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs w-full">
        {['1','2','3','4','5','6','7','8','9'].map(n => (
          <button
            key={n}
            onClick={() => press(n)}
            className="aspect-square bg-white rounded-2xl shadow-card text-2xl sm:text-3xl font-bold text-pig-600 active:scale-95 active:bg-pig-50"
          >
            {n}
          </button>
        ))}
        <div /> {/* 占位 */}
        <button
          onClick={() => press('0')}
          className="aspect-square bg-white rounded-2xl shadow-card text-2xl sm:text-3xl font-bold text-pig-600 active:scale-95 active:bg-pig-50"
        >
          0
        </button>
        <button
          onClick={back}
          className="aspect-square bg-cream-100 rounded-2xl shadow-card text-xl sm:text-2xl active:scale-95"
        >
          ⌫
        </button>
      </div>

      {error && (
        <p className="text-chili-500 mt-6 text-sm font-bold">密码不对，再试一次～</p>
      )}

      {/* 版本号（debug 友好：方便确认当前加载的是哪个 build） */}
      <p className="text-[10px] text-pig-400/60 mt-6 font-mono select-all" title={`build id: ${import.meta.env.VITE_BUILD_ID}`}>
        {import.meta.env.VITE_BUILD_ID === 'dev' ? 'dev' : `v${(import.meta.env.VITE_BUILD_ID || '').slice(0, 10)}`}
      </p>
    </main>
  )
}
