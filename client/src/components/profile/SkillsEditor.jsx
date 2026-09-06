import { useState } from 'react'
import { useSkills } from '../../hooks/useProfile'

export function SkillsEditor({ userId, skills }) {
  const [draft, setDraft] = useState('')
  const { mutate, isPending } = useSkills(userId)
  const names = skills.map((s) => s.name)

  // Both add and remove send the full new skills array — the backend endpoint
  // (PUT /users/me/skills) replaces the whole list rather than exposing separate
  // add/remove operations, so there's no incremental API to call here.
  const addSkill = (e) => {
    e.preventDefault()
    const name = draft.trim()
    if (!name || names.includes(name)) return
    mutate([...names, name])
    setDraft('')
  }

  const removeSkill = (name) => {
    mutate(names.filter((n) => n !== name))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {names.length === 0 && <span className="text-sm text-chrome-400">No skills yet.</span>}
        {names.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {name}
            <button
              type="button"
              onClick={() => removeSkill(name)}
              disabled={isPending}
              aria-label={`Remove ${name}`}
              className="text-brand-400 hover:text-brand-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={addSkill} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a skill"
          disabled={isPending}
          className="flex-1 border border-chrome-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={isPending || !draft.trim()}
          className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  )
}
