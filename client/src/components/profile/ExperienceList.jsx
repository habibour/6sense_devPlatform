import { useState } from 'react'
import { useExperiences } from '../../hooks/useProfile'
import { ExperienceForm } from './ExperienceForm'

function formatDateRange(from, to) {
  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${fmt(from)} — ${to ? fmt(to) : 'Present'}`
}

export function ExperienceList({ userId, experiences, editable }) {
  const { add, update, remove } = useExperiences(userId)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex flex-col gap-5 border-l-2 border-slate-200 pl-4">
      {experiences.length === 0 && !adding && (
        <p className="text-sm text-slate-400">No experience added yet.</p>
      )}

      {experiences.map((exp) =>
        editingId === exp.id ? (
          <ExperienceForm
            key={exp.id}
            initial={exp}
            submitting={update.isPending}
            onCancel={() => setEditingId(null)}
            onSubmit={(data) =>
              update.mutate({ experienceId: exp.id, ...data }, { onSuccess: () => setEditingId(null) })
            }
          />
        ) : (
          <div key={exp.id} className="flex justify-between items-start gap-3">
            <div>
              <div className="font-semibold text-sm text-slate-900">{exp.title}</div>
              <div className="text-sm text-slate-600">{exp.company}</div>
              <div className="font-mono text-xs text-slate-400 mt-0.5">{formatDateRange(exp.from, exp.to)}</div>
              {exp.description && (
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{exp.description}</p>
              )}
            </div>
            {editable && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(exp.id)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove.mutate(exp.id)}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ),
      )}

      {editable && adding && (
        <ExperienceForm
          submitting={add.isPending}
          onCancel={() => setAdding(false)}
          onSubmit={(data) => add.mutate(data, { onSuccess: () => setAdding(false) })}
        />
      )}

      {editable && !adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="border border-dashed border-slate-300 rounded-lg py-2.5 text-sm font-medium text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50"
        >
          + Add experience
        </button>
      )}
    </div>
  )
}
