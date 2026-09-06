import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { CommentForm } from '../components/comments/CommentForm'
import { CommentThread } from '../components/comments/CommentThread'
import { ReactionButtons } from '../components/reactions/ReactionButtons'
import { useComments } from '../hooks/useComments'
import { usePost } from '../hooks/usePosts'
import { useUser } from '../hooks/useProfile'
import { formatRelativeTime } from '../utils/time'

function PostAuthor({ authorId }) {
  const { data: author } = useUser(authorId)
  return (
    <Link to={`/profile/${authorId}`} className="font-medium text-brand-600 hover:text-brand-700">
      u/{author?.name ?? '…'}
    </Link>
  )
}

export default function PostDetailPage() {
  const { id } = useParams()
  const post = usePost(id)
  const comments = useComments(id)

  // Early-return guard clauses for the post query's pending/error states, rather than
  // one big ternary in the JSX — comments load independently below and get their own
  // inline pending/error handling once the post itself is known to exist.
  if (post.isPending) {
    return (
      <AppShell>
        <div className="flex justify-center text-chrome-400">
          <LoadingSpinner />
        </div>
      </AppShell>
    )
  }

  if (post.isError) {
    return (
      <AppShell>
        <ErrorBanner
          title={post.error.statusCode === 404 ? 'Post not found' : 'Failed to load post'}
          message={post.error.statusCode === 404 ? "This post doesn't exist or was removed." : post.error.message}
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="bg-chrome-0 border border-chrome-200 rounded-lg p-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mb-5">
          <ArrowLeft size={15} />
          Back to feed
        </Link>

        <h1 className="text-2xl font-bold text-chrome-900 mb-2.5 leading-snug">{post.data.title}</h1>

        <div className="flex items-center gap-1.5 text-sm text-chrome-500 mb-5">
          <PostAuthor authorId={post.data.authorId} />
          <span className="text-chrome-400">·</span>
          <span className="font-mono text-xs text-chrome-400">{formatRelativeTime(post.data.createdAt)}</span>
        </div>

        <p className="text-[15px] leading-relaxed text-chrome-800 whitespace-pre-wrap mb-6">{post.data.body}</p>

        {/* Horizontal reaction row here (not the vertical vote rail used on feed cards) —
            Reddit itself shows a horizontal vote row once you're past the feed. */}
        <div className="pt-4 border-t border-chrome-200 mb-8">
          <ReactionButtons
            targetType="POST"
            targetId={id}
            likeCount={post.data.likeCount}
            dislikeCount={post.data.dislikeCount}
            invalidateKeys={[['posts']]}
          />
        </div>

        <div className="mb-6">
          <CommentForm postId={id} />
        </div>

        <div className="text-sm font-semibold text-chrome-900 mb-1">
          {comments.data ? comments.data.length : 0} comments
        </div>

        {comments.isPending && (
          <div className="flex justify-center py-6 text-chrome-400">
            <LoadingSpinner />
          </div>
        )}

        {comments.isError && (
          <ErrorBanner title="Failed to load comments" message={comments.error.message} />
        )}

        {!comments.isPending && !comments.isError && (
          <CommentThread comments={comments.data} postId={id} />
        )}
      </div>
    </AppShell>
  )
}
