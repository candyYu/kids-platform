import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from '@/pages/Home'
import Review from '@/pages/Review'
import Lesson from '@/pages/Lesson'
import EarTraining from '@/pages/EarTraining'
import ParentReport from '@/pages/ParentReport'
import Piano from '@/pages/Piano'
import VoiceRestTimer from '@/components/VoiceRestTimer'
import { useStore } from '@/store'

export default function App() {
  const loadProgress = useStore((s) => s.loadProgress)

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return (
    <>
      <VoiceRestTimer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/review/:challengeId" element={<Review />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/ear-training" element={<EarTraining />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/report" element={<ParentReport />} />
      </Routes>
    </>
  )
}
