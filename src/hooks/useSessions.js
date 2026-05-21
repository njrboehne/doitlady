import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

// Returns ISO date string for today
export function today() {
  return new Date().toISOString().slice(0, 10)
}

// Returns array of ISO date strings for current week (Mon–Sun)
export function currentWeekDates() {
  const now = new Date()
  const day = now.getDay() // 0 = Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export function useAllSessions() {
  return useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), [])
}

export function useSessionsForSkill(skillId) {
  return useLiveQuery(
    () => db.sessions.where('skillId').equals(skillId).reverse().sortBy('date'),
    [skillId]
  )
}

// skills is the merged array from useSkills() — pass it in
export function useTodayStatus(skills) {
  const todayStr = today()
  const weekDates = currentWeekDates()

  return useLiveQuery(async () => {
    if (!skills) return null
    const allSessions = await db.sessions.toArray()

    return skills.map((skill) => {
      const id = skill.skillId ?? skill.id
      const { target } = skill
      let done, goal, sessions

      if (target.type === 'daily') {
        sessions = allSessions.filter((s) => s.skillId === id && s.date === todayStr)
        done = sessions.length
        goal = target.count
      } else {
        sessions = allSessions.filter((s) => s.skillId === id && weekDates.includes(s.date))
        done = sessions.length
        goal = target.count
      }

      return { skill: { ...skill, id }, done, goal, complete: done >= goal, sessions }
    })
  }, [skills])
}

export async function logSession({ skillId, durationMinutes, drills = [], notes = '' }) {
  await db.sessions.add({
    skillId,
    date: today(),
    durationMinutes: Number(durationMinutes),
    drills,
    notes,
    createdAt: Date.now(),
  })
}

export async function deleteSession(id) {
  await db.sessions.delete(id)
}
