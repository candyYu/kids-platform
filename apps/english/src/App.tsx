import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UnitPage from './pages/UnitPage'
import ReviewPage from './pages/ReviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/unit/:unitId" element={<UnitPage />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  )
}
