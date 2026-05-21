import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Today from './pages/Today'
import Stats from './pages/Stats'
import LogSession from './pages/LogSession'
import SkillDetail from './pages/SkillDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white max-w-md mx-auto relative">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/log/:skillId" element={<LogSession />} />
          <Route path="/skill/:skillId" element={<SkillDetail />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
