import { Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from '@/pages/Home'
import Review from '@/pages/Review'
import Lesson from '@/pages/Lesson'
import EarTraining from '@/pages/EarTraining'
import ParentReport from '@/pages/ParentReport'
import Piano from '@/pages/Piano'
import Violin from '@/pages/Violin'
import VoiceRestTimer from '@/components/VoiceRestTimer'
import { useStore } from '@/store'
import { isUnlocked, redirectToLogin } from '@/auth/gate'

export default function App() {
  const loadProgress = useStore((s) => s.loadProgress)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 密码 gate：没解锁就跳回门户输密码
    if (!isUnlocked()) {
      redirectToLogin('/music/')
      return
    }
    loadProgress()
    setReady(true)
  }, [loadProgress])

  if (!ready) return null

  return (
    <>
      <VoiceRestTimer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/review/:challengeId" element={<Review />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/ear-training" element={<EarTraining />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/violin" element={<Violin />} />
        <Route path="/report" element={<ParentReport />} />
      </Routes>
    </>
  )
}
