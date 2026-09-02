import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Errors from './pages/Errors'
import UnitsPage from './pages/UnitsPage'
import LessonPage from './pages/LessonPage'

export default function App() {
  const location = useLocation()
  const isImmersive = location.pathname.startsWith('/practice') || location.pathname.startsWith('/lesson')

  return (
    <div className="min-h-screen">
      {/* 练习/上课页全屏沉浸，其他页显示底部导航 */}
      {isImmersive ? (
        <Routes>
          <Route path="/practice/:topicId" element={<Practice />} />
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
        </Routes>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/errors" element={<Errors />} />
            <Route path="/units/:unitId" element={<UnitsPage />} />
          </Routes>
          <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t-2 border-cream-200 flex justify-around py-2 z-10">
            <Link to="/" className="flex flex-col items-center px-6 py-1 text-child font-bold text-pig-600">
              <span className="text-2xl">🏠</span>
              <span>首页</span>
            </Link>
            <Link to="/errors" className="flex flex-col items-center px-6 py-1 text-child font-bold text-pig-600">
              <span className="text-2xl">📕</span>
              <span>错题本</span>
            </Link>
          </nav>
          {/* 底部导航占位 */}
          <div className="h-16" />
        </>
      )}
    </div>
  )
}
