import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UnitPage from './pages/UnitPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/unit/:unitId" element={<UnitPage />} />
    </Routes>
  )
}
