import { useState } from 'react'

export function ExperienceForm({ initial, onSubmit, onCancel, submitting }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [company, setCompany] = useState(initial?.company ?? '')
  const [from, setFrom] = useState(initial?.from ? initial.from.slice(0, 10) : '')
  const [to, setTo] = useState(initial?.to ? initial.to.slice(0, 10) : '')
  const [description, setDescription] = useState(initial?.description ?? '')

  const handleSubmit = (e) => {
    e.preventDefault()
    // `to` and `description` are omitted entirely when blank, rather than sent as
    // empty strings — `to` blank means "current role" (backend treats a missing `to`
    // as ongoing), and an empty description shouldn't overwrite a real one on edit.
    const payload = {
      title,
      company,
      from: new Date(from).toISOString(),
    }
    if (to) payload.to = new Date(to).toISOString()
    if (description.trim()) payload.description = description.trim()
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="border border-chrome-200 rounded-lg p-4 flex flex-col gap-3 bg-chrome-50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-chrome-600 mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-chrome-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-chrome-600 mb-1">Company</label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-chrome-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-chrome-600 mb-1">From</label>
          <input
            required
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-chrome-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-chrome-600 mb-1">To (leave blank if current)</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-chrome-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-chrome-600 mb-1">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-chrome-200 rounded px-2.5 py-1.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-chrome-500 hover:text-chrome-700">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-500 text-white rounded px-4 py-1.5 text-sm font-medium hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
