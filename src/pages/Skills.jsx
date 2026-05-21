import { useNavigate } from 'react-router-dom'
import { useSkills, deleteCustomSkill } from '../hooks/useSkills'

export default function Skills() {
  const navigate = useNavigate()
  const skills = useSkills()

  if (!skills) return <div className="p-6 text-slate-400">Loading…</div>

  return (
    <div className="px-4 pt-6 pb-28">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-slate-400 text-sm">{skills.length} total</p>
        </div>
        <button
          onClick={() => navigate('/skills/add')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {skills.map((skill) => {
          const id = skill.skillId ?? skill.id
          return (
            <div
              key={id}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <button
                className="flex items-center gap-3 flex-1 text-left"
                onClick={() => navigate(`/skill/${id}`)}
              >
                <span className="text-2xl">{skill.emoji}</span>
                <div>
                  <p className="text-white font-medium">{skill.name}</p>
                  <p className="text-xs text-slate-400">
                    {skill.target.type === 'daily'
                      ? 'Daily'
                      : `${skill.target.count}× per week`}
                  </p>
                </div>
              </button>
              {skill.custom && (
                <button
                  onClick={() => deleteCustomSkill(skill.id)}
                  className="text-slate-600 hover:text-red-400 text-xs transition-colors ml-4"
                >
                  delete
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
