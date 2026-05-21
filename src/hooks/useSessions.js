import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { SKILLS } from '../data/skills'

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

export function useTodayStatus() {
  const todayStr = today()
  const weekDates = currentWeekDates()

  return useLiveQuery(async () => {
    const allSessions = await db.sessions.toArray()

    return SKILLS.map((skill) => {
      const { target } = skill
      let done, goal, sessions

      if (target.type === 'daily') {
        sessions = allSessions.filter(
          (s) => s.skillId === skill.id && s.date === todayStr
        )
        done = sessions.length
        goal = target.count
      } else {
        sessions = allSessions.filter(
          (s) => s.skillId === skill.id && weekDates.includes(s.date)
        )
        done = sessions.length
        goal = target.count
      }

      return {
        skill,
        done,
        goal,
        complete: done >= goal,
        sessions,
      }
    })
  }, [])
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
