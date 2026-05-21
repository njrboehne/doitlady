import { useNavigate, useParams } from 'react-router-dom'
import { skillById } from '../data/skills'
import { useSessionsForSkill, deleteSession } from '../hooks/useSessions'

export default function SkillDetail() {
  const { skillId } = useParams()
  const navigate = useNavigate()
  const skill = skillById[skillId]
  const sessions = useSessionsForSkill(skillId)

  if (!skill) return <div className="p-6 text-slate-400">Skill not found.</div>
  if (!sessions) return <div className="p-6 text-slate-400">Loading…</div>

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  // Count drill frequency
  const drillCounts = {}
  sessions.forEach((s) => {
    (s.drills || []).forEach((d) => {
      drillCounts[d] = (drillCounts[d] || 0) + 1
    })
  })

  return (
    <div className="px-4 pt-6 pb-28">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{skill.emoji}</span>
        <h1 className="text-2xl font-bold text-white">{skill.name}</h1>
      </div>
      <p className="text-slate-400 text-sm mb-6">
        {sessions.length} sessions · {(totalMinutes / 60).toFixed(1)}h total
      </p>

      {/* Drill Library */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Drill Library
        </h2>
        <div className="space-y-2">
          {skill.drills.map((drill) => (
            <div
              key={drill.id}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
            >
              <div className="flex items-start justify-between">
                <p className="font-medium text-white text-sm">{drill.label}</p>
                {drillCounts[drill.id] && (
                  <span className="text-xs text-blue-400 ml-2 shrink-0">
                    {drillCounts[drill.id]}×
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{drill.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Session History */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
          History
        </h2>
        {sessions.length === 0 && (
          <p className="text-slate-500 text-sm">No sessions yet.</p>
        )}
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              skill={skill}
              onDelete={() => deleteSession(session.id)}
            />
          ))}
        </div>
      </section>

      {/* Log new session */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={() => navigate(`/log/${skill.id}`)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl text-base transition-colors"
        >
          + Log session
        </button>
      </div>
    </div>
  )
}

function SessionCard({ session, skill, onDelete }) {
  const drillLabels = (session.drills || [])
    .map((id) => skill.drills.find((d) => d.id === id)?.label)
    .filter(Boolean)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-medium">{session.date}</p>
          <p className="text-slate-400 text-xs">{session.durationMinutes} min</p>
        </div>
        <button
          onClick={onDelete}
          className="text-slate-600 hover:text-red-400 text-xs transition-colors"
        >
          delete
        </button>
      </div>
      {drillLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {drillLabels.map((label, i) => (
            <span
              key={i}
              className="text-xs bg-slate-700 text-slate-300 rounded-full px-2 py-0.5"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      {session.notes && (
        <p className="text-xs text-slate-400 mt-2 italic">{session.notes}</p>
      )}
    </div>
  )
}
