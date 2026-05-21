import Dexie from 'dexie'

export const db = new Dexie('doitlady')

db.version(1).stores({
  sessions: '++id, skillId, date, durationMinutes',
})

db.version(2).stores({
  sessions: '++id, skillId, date, durationMinutes',
  customSkills: '++id, &skillId',
})
