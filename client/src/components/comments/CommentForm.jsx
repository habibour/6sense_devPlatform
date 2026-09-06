import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCreateComment } from '../../hooks/useComments'

// Doubles as both the top-level "add a comment" form (no parentCommentId, no onDone)
// and a reply form (parentCommentId set, onDone collapses it back into the "Reply"
// toggle in CommentThread) — same component, different props, avoids a near-duplicate.
export function CommentForm({ postId, parentCommentId = null, label = 'Add a comment', onDone }) {
  const { user } = useAuth()
  const createComment = useCreateComment(postId)
  const [body, setBody] = useState('')
  const [error, setError] = useState(null)

  // Logged-out visitors get a login prompt instead of a disabled form — matches the
  // pattern used by ReactionButtons for the same "read-only when logged out" rule.
  if (!user) {
    return (
      <p className="text-sm text-chrome-500">
        <Link to="/login" className="text-brand-600 hover:text-brand-700">Log in</Link> to comment.
      </p>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createComment.mutateAsync({ body, parentCommentId })
      setBody('')
      onDone?.()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-sm font-semibold text-chrome-900 mb-2">{label}</div>
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <textarea
        required
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full border border-chrome-200 rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex justify-end gap-2 mt-2">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="px-3 py-1.5 text-sm text-chrome-500 hover:text-chrome-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={createComment.isPending}
          className="bg-brand-500 text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-brand-600 disabled:opacity-60"
        >
          {createComment.isPending ? 'Posting…' : 'Post comment'}
        </button>
      </div>
    </form>
  )
}
