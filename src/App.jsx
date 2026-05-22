import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Today from './pages/Today'
import Stats from './pages/Stats'
import Skills from './pages/Skills'
import AddSkill from './pages/AddSkill'
import EditSkill from './pages/EditSkill'
import LogSession from './pages/LogSession'
import SkillDetail from './pages/SkillDetail'

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return
  const already = await navigator.storage.persisted()
  if (!already) {
    await navigator.storage.persist()
  }
}

export default function App() {
  useEffect(() => {
    requestPersistentStorage()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white max-w-md mx-auto relative">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/add" element={<AddSkill />} />
          <Route path="/skills/edit/:skillId" element={<EditSkill />} />
          <Route path="/log/:skillId" element={<LogSession />} />
          <Route path="/skill/:skillId" element={<SkillDetail />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
