import { Link, useParams } from 'react-router-dom'
import { PageContainer } from '../components/layout/PageContainer'
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
    <Link to={`/profile/${authorId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
      {author?.name ?? '…'}
    </Link>
  )
}

export default function PostDetailPage() {
  const { id } = useParams()
  const post = usePost(id)
  const comments = useComments(id)

  if (post.isPending) {
    return (
      <PageContainer>
        <div className="flex justify-center text-slate-400">
          <LoadingSpinner />
        </div>
      </PageContainer>
    )
  }

  if (post.isError) {
    return (
      <PageContainer>
        <ErrorBanner
          title={post.error.statusCode === 404 ? 'Post not found' : 'Failed to load post'}
          message={post.error.statusCode === 404 ? "This post doesn't exist or was removed." : post.error.message}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-5">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to feed
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-2.5 leading-snug">{post.data.title}</h1>

      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
        <PostAuthor authorId={post.data.authorId} />
        <span className="text-slate-400">·</span>
        <span className="font-mono text-xs text-slate-400">{formatRelativeTime(post.data.createdAt)}</span>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap mb-6">{post.data.body}</p>

      <div className="pt-4 border-t border-slate-200 mb-8">
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

      <div className="text-sm font-semibold text-slate-900 mb-1">
        {comments.data ? comments.data.length : 0} comments
      </div>

      {comments.isPending && (
        <div className="flex justify-center py-6 text-slate-400">
          <LoadingSpinner />
        </div>
      )}

      {comments.isError && (
        <ErrorBanner title="Failed to load comments" message={comments.error.message} />
      )}

      {!comments.isPending && !comments.isError && (
        <CommentThread comments={comments.data} postId={id} />
      )}
    </PageContainer>
  )
}
