import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSkill, updateCustomSkill } from '../hooks/useSkills'

const EMOJI_SUGGESTIONS = ['🎯', '🧘', '📚', '🎨', '🏊', '🚴', '🥊', '🎭', '💃', '🧗', '🎲', '✍️', '🌿', '🔬', '🎬']

export default function EditSkill() {
  const { skillId } = useParams()
  const navigate = useNavigate()
  const skill = useSkill(skillId)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [targetType, setTargetType] = useState('daily')
  const [targetCount, setTargetCount] = useState(1)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  // Populate form once skill loads
  useEffect(() => {
    if (skill && !ready) {
      setName(skill.name)
      setEmoji(skill.emoji ?? '')
      setTargetType(skill.target.type)
      setTargetCount(skill.target.count)
      setReady(true)
    }
  }, [skill, ready])

  if (skill === null) return <div className="p-6 text-slate-400">Skill not found.</div>
  if (!skill || !ready) return <div className="p-6 text-slate-400">Loading…</div>
  if (!skill.custom) return <div className="p-6 text-slate-400">Built-in skills cannot be edited.</div>

  const canSave = name.trim().length > 0

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    await updateCustomSkill(skill.id, {
      name: name.trim(),
      emoji: emoji.trim() || '⭐',
      targetType,
      targetCount,
    })
    navigate('/skills')
  }

  return (
    <div className="px-4 pt-6 pb-32">
      <button onClick={() => navigate(-1)} className="text-slate-400 text-sm mb-4 flex items-center gap-1">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-6">Edit skill</h1>

      {/* Name */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Name
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </section>

      {/* Emoji */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Emoji
        </h2>
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={2}
          className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
        />
        <div className="flex flex-wrap gap-2">
          {EMOJI_SUGGESTIONS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-xl p-2 rounded-lg transition-colors ${
                emoji === e ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      {/* Frequency */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Frequency
        </h2>
        <div className="flex gap-2 mb-4">
          {['daily', 'weekly'].map((t) => (
            <button
              key={t}
              onClick={() => { setTargetType(t); setTargetCount(t === 'daily' ? 1 : 3) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                targetType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {targetType === 'weekly' && (
          <div>
            <p className="text-slate-400 text-sm mb-2">Times per week</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setTargetCount(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    targetCount === n
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 rounded-2xl text-base transition-colors"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
