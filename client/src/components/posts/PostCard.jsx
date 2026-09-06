import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { ReactionButtons } from '../reactions/ReactionButtons'
import { useUser } from '../../hooks/useProfile'
import { formatRelativeTime } from '../../utils/time'

function AuthorLink({ authorId }) {
  const { data: author } = useUser(authorId)

  return (
    <Link to={`/profile/${authorId}`} className="font-medium text-brand-600 hover:text-brand-700">
      u/{author?.name ?? '…'}
    </Link>
  )
}

export function PostCard({ post }) {
  return (
    <div className="flex bg-chrome-0 border border-chrome-200 rounded-md hover:border-chrome-300 hover:shadow-sm transition-all mb-3">
      <div className="w-11 flex-shrink-0 flex flex-col items-center py-3 bg-chrome-50 rounded-l-md">
        <ReactionButtons
          orientation="vertical"
          targetType="POST"
          targetId={post.id}
          likeCount={post.likeCount}
          dislikeCount={post.dislikeCount}
          invalidateKeys={[['posts']]}
        />
      </div>

      <div className="flex-1 min-w-0 p-3">
        <div className="text-xs text-chrome-500">
          Posted by <AuthorLink authorId={post.authorId} /> · {formatRelativeTime(post.createdAt)}
        </div>

        <Link
          to={`/posts/${post.id}`}
          className="block text-base font-semibold text-chrome-900 mt-1 mb-1.5 leading-snug hover:text-brand-600"
        >
          {post.title}
        </Link>

        {/* Body preview: real post.body truncated client-side, not invented content —
            already returned by GET /api/posts alongside likeCount/dislikeCount/commentCount. */}
        <p className="text-sm text-chrome-600 line-clamp-3 whitespace-pre-wrap">{post.body}</p>

        <div className="flex items-center gap-1.5 text-chrome-500 text-xs mt-2.5">
          <MessageSquare size={14} />
          <span className="font-mono">{post.commentCount} comments</span>
        </div>
      </div>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="flex bg-chrome-0 border border-chrome-200 rounded-md mb-3 animate-pulse">
      <div className="w-11 flex-shrink-0 bg-chrome-50 rounded-l-md" />
      <div className="flex-1 p-3">
        <div className="h-3 bg-chrome-200 rounded w-2/5 mb-3" />
        <div className="h-[17px] bg-chrome-200 rounded w-4/5 mb-2" />
        <div className="h-3 bg-chrome-200 rounded w-full mb-1.5" />
        <div className="h-3 bg-chrome-200 rounded w-3/4 mb-3" />
        <div className="h-3 bg-chrome-200 rounded w-16" />
      </div>
    </div>
  )
}
