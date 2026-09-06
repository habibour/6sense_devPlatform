import { useState } from 'react'
import { Reply } from 'lucide-react'
import { ReactionButtons } from '../reactions/ReactionButtons'
import { useUser } from '../../hooks/useProfile'
import { formatRelativeTime } from '../../utils/time'
import { CommentForm } from './CommentForm'

// The API returns a flat list (see phase-2 spec F4); this assembles it into a tree
// client-side. Building a Map first gives O(1) parent lookup by id, and pushing each
// comment onto its parent's `replies` array (found via that same Map) — rather than
// filtering the full list per parent — keeps this O(n) instead of O(n²) for deep threads.
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
  return <span className="font-semibold text-chrome-900">{author?.name ?? '…'}</span>
}

function CommentNode({ comment, postId }) {
  const [replying, setReplying] = useState(false)

  return (
    <div className="py-4 border-b border-chrome-200 last:border-b-0">
      <div className="flex items-center gap-1.5 text-sm mb-1.5">
        <CommentAuthor authorId={comment.authorId} />
        <span className="text-chrome-400">·</span>
        <span className="font-mono text-xs text-chrome-400">{formatRelativeTime(comment.createdAt)}</span>
      </div>

      <p className="text-sm leading-relaxed text-chrome-800 mb-2 whitespace-pre-wrap">{comment.body}</p>

      <div className="flex items-center gap-4">
        <ReactionButtons
          targetType="COMMENT"
          targetId={comment.id}
          likeCount={comment.likeCount}
          dislikeCount={comment.dislikeCount}
          invalidateKeys={[['comments', postId]]}
          size="sm"
        />
        <button
          type="button"
          onClick={() => setReplying((r) => !r)}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          <Reply size={14} />
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
        // Thread-guide line tinted brand-100 (rather than a plain gray) so nested
        // depth reads as part of the same brand chrome as the rest of the page.
        <div className="mt-4 ml-6 pl-4 border-l-2 border-brand-100 flex flex-col">
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
    return <p className="text-sm text-chrome-500">No comments yet.</p>
  }

  return (
    <div>
      {roots.map((comment) => (
        <CommentNode key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  )
}
