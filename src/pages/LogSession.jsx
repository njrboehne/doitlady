import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSkill } from '../hooks/useSkills'
import { logSession } from '../hooks/useSessions'

const DURATION_PRESETS = [10, 20, 30, 45, 60, 90]

export default function LogSession() {
  const { skillId } = useParams()
  const navigate = useNavigate()
  const skill = useSkill(skillId)

  const [duration, setDuration] = useState(30)
  const [customDuration, setCustomDuration] = useState('')
  const [selectedDrills, setSelectedDrills] = useState([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  if (skill === null) return <div className="p-6 text-slate-400">Skill not found.</div>
  if (skill === undefined) return <div className="p-6 text-slate-400">Loading…</div>

  const effectiveDuration = customDuration ? Number(customDuration) : duration
  const drills = skill.drills ?? []

  function toggleDrill(id) {
    setSelectedDrills((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (!effectiveDuration || effectiveDuration < 1) return
    setSaving(true)
    await logSession({
      skillId,
      durationMinutes: effectiveDuration,
      drills: selectedDrills,
      notes,
    })
    navigate(-1)
  }

  return (
    <div className="px-4 pt-6 pb-32">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm mb-4 flex items-center gap-1">
        ← Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{skill.emoji}</span>
        <h1 className="text-2xl font-bold text-white">{skill.name}</h1>
      </div>

      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Duration (minutes)
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setDuration(p); setCustomDuration('') }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                duration === p && !customDuration
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 active:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Custom…"
          value={customDuration}
          onChange={(e) => setCustomDuration(e.target.value)}
          className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </section>

      {drills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Drills practiced
          </h2>
          <div className="space-y-2">
            {drills.map((drill) => {
              const active = selectedDrills.includes(drill.id)
              return (
                <button
                  key={drill.id}
                  onClick={() => toggleDrill(drill.id)}
                  className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                    active
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 active:bg-slate-700'
                  }`}
                >
                  <p className="font-medium text-sm">{drill.label}</p>
                  {drill.note && <p className="text-xs text-slate-400 mt-0.5">{drill.note}</p>}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Notes (optional)
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you work on? Any breakthroughs or blockers?"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </section>

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={handleSave}
          disabled={saving || !effectiveDuration}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 rounded-2xl text-base transition-colors"
        >
          {saving ? 'Saving…' : `Log ${effectiveDuration} min`}
        </button>
      </div>
    </div>
  )
}
