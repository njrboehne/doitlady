import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useSkill } from '../hooks/useSkills'
import { logSession } from '../hooks/useSessions'

const DURATION_PRESETS = [5, 10, 20, 30, 45, 60]

function fmtMMSS(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function fmtDuration(minutes) {
  const totalSeconds = Math.round(minutes * 60)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default function LogSession() {
  const { skillId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const skill = useSkill(skillId)

  // Timer state
  const [elapsed, setElapsed] = useState(0)       // seconds
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const baseElapsedRef = useRef(0)

  // Duration — in decimal minutes; null means nothing selected yet
  const [durationMinutes, setDurationMinutes] = useState(null)
  const [timerUsed, setTimerUsed] = useState(false)

  // Pre-select drill from ?drill= param
  const preselectedDrill = searchParams.get('drill')
  const [selectedDrills, setSelectedDrills] = useState(
    preselectedDrill ? [preselectedDrill] : []
  )
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
    const finalElapsed = baseElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    setElapsed(finalElapsed)
    baseElapsedRef.current = finalElapsed
    if (finalElapsed > 0) {
      setDurationMinutes(finalElapsed / 60)
      setTimerUsed(true)
    }
  }, [])

  // Clean up on unmount
  useEffect(() => () => clearInterval(intervalRef.current), [])

  if (skill === null) return <div className="p-6 text-slate-400">Skill not found.</div>
  if (skill === undefined) return <div className="p-6 text-slate-400">Loading…</div>

  const drills = skill.drills ?? []

  function startTimer() {
    startTimeRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setElapsed(baseElapsedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 500)
    setRunning(true)
    setTimerUsed(false)
  }

  function resetTimer() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    baseElapsedRef.current = 0
    setTimerUsed(false)
    if (durationMinutes !== null && timerUsed) setDurationMinutes(null)
  }

  function selectPreset(mins) {
    if (running) stopTimer()
    setDurationMinutes(mins)
    setTimerUsed(false)
  }

  function toggleDrill(id) {
    setSelectedDrills((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    if (running) stopTimer()
    if (!durationMinutes || durationMinutes <= 0) return
    setSaving(true)
    await logSession({
      skillId,
      durationMinutes,
      drills: selectedDrills,
      notes,
    })
    navigate(-1)
  }

  const canSave = durationMinutes > 0
  const saveLabel = saving
    ? 'Saving…'
    : canSave
    ? `Log ${fmtDuration(durationMinutes)}`
    : 'Log session'

  return (
    <div className="px-4 pt-6 pb-32">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm mb-4 flex items-center gap-1">
        ← Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{skill.emoji}</span>
        <h1 className="text-2xl font-bold text-white">{skill.name}</h1>
      </div>

      {/* Timer */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Timer
        </h2>
        <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-5 flex flex-col items-center gap-4">
          <span
            className={`text-5xl font-mono font-bold tabular-nums tracking-tight transition-colors ${
              running ? 'text-blue-400' : elapsed > 0 ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            {fmtMMSS(elapsed)}
          </span>
          <div className="flex gap-3">
            {!running ? (
              <button
                onClick={startTimer}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                {elapsed > 0 ? 'Resume' : 'Start'}
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                Stop
              </button>
            )}
            {elapsed > 0 && !running && (
              <button
                onClick={resetTimer}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {timerUsed && durationMinutes > 0 && (
            <p className="text-xs text-emerald-400">
              {fmtDuration(durationMinutes)} will be logged
            </p>
          )}
        </div>
      </section>

      {/* Manual duration presets */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Or set manually (minutes)
        </h2>
        <div className="flex flex-wrap gap-2">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => selectPreset(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !timerUsed && durationMinutes === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 active:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {/* Drills */}
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

      {/* Notes */}
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
          disabled={saving || !canSave}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 rounded-2xl text-base transition-colors"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
