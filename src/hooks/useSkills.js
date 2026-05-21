import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { SKILLS } from '../data/skills'

export function useSkills() {
  const custom = useLiveQuery(() => db.customSkills.toArray(), [])
  if (!custom) return null
  return [...SKILLS, ...custom]
}

// Returns a single skill by its id/skillId — works for both static and custom
export function useSkill(id) {
  const static_ = SKILLS.find((s) => s.id === id)
  const custom = useLiveQuery(
    () => db.customSkills.where('skillId').equals(id).first(),
    [id]
  )
  if (static_) return static_
  return custom ?? null
}

export async function addCustomSkill({ name, emoji, targetType, targetCount }) {
  const skillId = `custom_${Date.now()}`
  await db.customSkills.add({
    skillId,
    name,
    emoji: emoji || '⭐',
    target: { type: targetType, count: Number(targetCount) },
    drills: [],
    custom: true,
  })
}

export async function deleteCustomSkill(id) {
  await db.customSkills.delete(id)
}
