import { useNavigate } from 'react-router-dom'
import { useTodayStatus } from '../hooks/useSessions'
import { useSkills } from '../hooks/useSkills'

export default function Today() {
  const navigate = useNavigate()
  const skills = useSkills()
  const statuses = useTodayStatus(skills)

  if (!statuses) return <div className="p-6 text-slate-400">Loading…</div>

  const complete = statuses.filter((s) => s.complete)
  const pending = statuses.filter((s) => !s.complete)

  return (
    <div className="px-4 pt-6 pb-28">
      <h1 className="text-2xl font-bold text-white mb-1">Today</h1>
      <p className="text-slate-400 text-sm mb-6">
        {complete.length}/{statuses.length} practices on track
      </p>

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Pending
          </h2>
          <div className="space-y-2">
            {pending.map(({ skill, done, goal }) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                done={done}
                goal={goal}
                complete={false}
                onClick={() => navigate(`/log/${skill.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {complete.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Done
          </h2>
          <div className="space-y-2">
            {complete.map(({ skill, done, goal }) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                done={done}
                goal={goal}
                complete={true}
                onClick={() => navigate(`/log/${skill.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SkillRow({ skill, done, goal, complete, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
        complete
          ? 'bg-slate-800/50 border border-slate-700/50'
          : 'bg-slate-800 border border-slate-700 active:bg-slate-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{skill.emoji}</span>
        <div>
          <p className={`font-medium ${complete ? 'text-slate-400' : 'text-white'}`}>
            {skill.name}
          </p>
          <p className="text-xs text-slate-500">
            {skill.target.type === 'daily' ? 'Daily' : `${goal}× this week`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ProgressPips done={done} goal={goal} complete={complete} />
        {!complete && <span className="text-slate-400 text-sm">+</span>}
        {complete && <span className="text-emerald-400 text-lg">✓</span>}
      </div>
    </button>
  )
}

function ProgressPips({ done, goal, complete }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: goal }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < done
              ? complete
                ? 'bg-emerald-500'
                : 'bg-blue-400'
              : 'bg-slate-600'
          }`}
        />
      ))}
    </div>
  )
}
