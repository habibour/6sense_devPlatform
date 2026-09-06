import { useState } from 'react'

export function PostForm({ onSubmit, submitting, error }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ title, body })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6">
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="title">Title</label>
      <input
        id="title"
        type="text"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full mb-4 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
      />

      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="body">Body</label>
      <textarea
        id="body"
        required
        rows={8}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full mb-4 border border-slate-200 rounded px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-600"
      />

      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? 'Posting…' : 'Post'}
      </button>
    </form>
  )
}
