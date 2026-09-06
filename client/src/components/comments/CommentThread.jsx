import { useState } from 'react'
import { useUser } from '../../hooks/useProfile'
import { formatRelativeTime } from '../../utils/time'
import { CommentForm } from './CommentForm'

function buildCommentTree(comments) {
  const byId = new Map(comments.map((c) => [c.id, { ...c, replies: [] }]))
  const roots = []

  byId.forEach((comment) => {
    const parent = comment.parentCommentId && byId.get(comment.parentCommentId)
    if (parent) {
      parent.replies.push(comment)
    } else {
      roots.push(comment)
    }
  })

  return roots
}

function CommentAuthor({ authorId }) {
  const { data: author } = useUser(authorId)
  return <span className="font-semibold text-slate-900">{author?.name ?? '…'}</span>
}

function CommentNode({ comment, postId }) {
  const [replying, setReplying] = useState(false)

  return (
    <div className="py-4 border-b border-slate-200 last:border-b-0">
      <div className="flex items-center gap-1.5 text-sm mb-1.5">
        <CommentAuthor authorId={comment.authorId} />
        <span className="text-slate-400">·</span>
        <span className="font-mono text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
      </div>

      <p className="text-sm leading-relaxed text-slate-800 mb-2 whitespace-pre-wrap">{comment.body}</p>

      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span className="font-mono">{comment.likeCount}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span className="font-mono">{comment.dislikeCount}</span>
        </span>
        <button
          type="button"
          onClick={() => setReplying((r) => !r)}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Reply
        </button>
      </div>

      {replying && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            parentCommentId={comment.id}
            label="Reply"
            onDone={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-4 ml-6 pl-4 border-l-2 border-slate-200 flex flex-col">
          {comment.replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} postId={postId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentThread({ comments, postId }) {
  const roots = buildCommentTree(comments)

  if (roots.length === 0) {
    return <p className="text-sm text-slate-500">No comments yet.</p>
  }

  return (
    <div>
      {roots.map((comment) => (
        <CommentNode key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  )
}
