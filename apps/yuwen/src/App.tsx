import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import HomePage from './routes/HomePage'
import LessonMapPage from './routes/LessonMapPage'
import LessonPage from './routes/LessonPage'
import ErrorBookPage from './routes/ErrorBookPage'
import ReviewPage from './routes/ReviewPage'
import ParentDashboardPage from './routes/ParentDashboardPage'
import SettingsPage from './routes/SettingsPage'
import CheatSheetPage from './routes/CheatSheetPage'
import PoemList from './components/poem/PoemList'
import PoemReader from './components/poem/PoemReader'
import { isUnlocked, redirectToLogin } from './auth/gate'

export default function App() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!isUnlocked()) {
      redirectToLogin('/yuwen/')
      return
    }
    setReady(true)
  }, [])
  if (!ready) return null

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/map" element={<LessonMapPage />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="/errorbook" element={<ErrorBookPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/parent" element={<ParentDashboardPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/cheatsheet" element={<CheatSheetPage />} />
      <Route path="/poem" element={<PoemList />} />
      <Route path="/poem/:id" element={<PoemReader />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}