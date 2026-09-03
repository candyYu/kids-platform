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
import TeacherPage from './routes/TeacherPage'
import PoemList from './components/poem/PoemList'
import PoemReader from './components/poem/PoemReader'
import StoryList from './components/storybook/StoryList'
import StoryReader from './components/storybook/StoryReader'
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
      <Route path="/teacher" element={<TeacherPage />} />
      <Route path="/poem" element={<PoemList />} />
      <Route path="/poem/:id" element={<PoemReader />} />
      <Route path="/storybook" element={<StoryList />} />
      <Route path="/storybook/:id" element={<StoryReader />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}