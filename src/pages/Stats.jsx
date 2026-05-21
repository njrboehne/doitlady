import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllSessions, currentWeekDates } from '../hooks/useSessions'
import { useSkills } from '../hooks/useSkills'

function getLast8Weeks() {
  const weeks = []
  const now = new Date()
  const day = now.getDay()
  const thisMon = new Date(now)
  thisMon.setDate(now.getDate() - ((day + 6) % 7))
  thisMon.setHours(0, 0, 0, 0)

  for (let w = 0; w < 8; w++) {
    const mon = new Date(thisMon)
    mon.setDate(thisMon.getDate() - w * 7)
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(mon)
      d.setDate(mon.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
    weeks.unshift(dates)
  }
  return weeks
}

export default function Stats() {
  const navigate = useNavigate()
  const sessions = useAllSessions()
  const skills = useSkills()
  const weeks = useMemo(() => getLast8Weeks(), [])
  const weekDates = currentWeekDates()

  if (!sessions || !skills) return <div className="p-6 text-slate-400">Loading…</div>

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  return (
    <div className="px-4 pt-6 pb-28">
      <h1 className="text-2xl font-bold text-white mb-1">Stats</h1>
      <p className="text-slate-400 text-sm mb-6">{totalHours}h logged total</p>

      <div className="space-y-6">
        {skills.map((skill) => {
          const id = skill.skillId ?? skill.id
          const skillSessions = sessions.filter((s) => s.skillId === id)
          const totalSkillMin = skillSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
          const thisWeekCount = skillSessions.filter((s) => weekDates.includes(s.date)).length
          const streak = computeStreak({ ...skill, id }, sessions)
          const weekCounts = weeks.map((wDates) =>
            skillSessions.filter((s) => wDates.includes(s.date)).length
          )

          return (
            <div
              key={id}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-4"
              onClick={() => navigate(`/skill/${id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{skill.emoji}</span>
                  <span className="font-semibold text-white">{skill.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    {skill.target.type === 'weekly'
                      ? `${thisWeekCount}/${skill.target.count} this week`
                      : `${thisWeekCount} this week`}
                  </p>
                  {streak > 0 && (
                    <p className="text-xs text-amber-400 font-medium">{streak}🔥 streak</p>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-2">
                {weekCounts.map((count, i) => {
                  const pct = Math.min(count / skill.target.count, 1)
                  return (
                    <div
                      key={i}
                      className="flex-1 h-6 rounded"
                      style={{
                        backgroundColor:
                          pct === 0
                            ? 'rgb(51 65 85)'
                            : pct < 0.5
                            ? 'rgb(37 99 235 / 0.5)'
                            : pct < 1
                            ? 'rgb(37 99 235 / 0.8)'
                            : 'rgb(16 185 129)',
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>8 wks ago</span>
                <span>{(totalSkillMin / 60).toFixed(1)}h total</span>
                <span>this week</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function computeStreak(skill, allSessions) {
  const skillSessions = allSessions.filter((s) => s.skillId === skill.id)
  if (!skillSessions.length) return 0
  const dateSet = new Set(skillSessions.map((s) => s.date))

  if (skill.target.type === 'daily') {
    let streak = 0
    const d = new Date()
    while (true) {
      const key = d.toISOString().slice(0, 10)
      if (dateSet.has(key)) { streak++; d.setDate(d.getDate() - 1) }
      else break
    }
    return streak
  } else {
    const weeks = getLast8Weeks()
    let streak = 0
    for (let w = weeks.length - 1; w >= 0; w--) {
      const count = skillSessions.filter((s) => weeks[w].includes(s.date)).length
      if (count >= skill.target.count) streak++
      else break
    }
    return streak
  }
}
