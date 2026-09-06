import { Link } from 'react-router-dom'
import { useUser } from '../../hooks/useProfile'
import { formatRelativeTime } from '../../utils/time'

function AuthorLink({ authorId }) {
  const { data: author } = useUser(authorId)

  return (
    <Link to={`/profile/${authorId}`} className="font-medium text-indigo-600 hover:text-indigo-700">
      {author?.name ?? '…'}
    </Link>
  )
}

export function PostCard({ post }) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white transition-shadow hover:shadow-md hover:border-slate-300 p-5 pb-4 mb-4">
      <Link
        to={`/posts/${post.id}`}
        className="block text-[17px] font-semibold text-slate-900 mb-1.5 leading-snug hover:text-indigo-600"
      >
        {post.title}
      </Link>

      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <AuthorLink authorId={post.authorId} />
        <span className="text-slate-400">·</span>
        <span className="font-mono text-slate-400 text-xs">{formatRelativeTime(post.createdAt)}</span>
      </div>

      <div className="flex items-center gap-4 mt-3.5 pt-3.5 border-t border-slate-200">
        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span className="font-mono">{post.likeCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
          <span className="font-mono">{post.dislikeCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="font-mono">{post.commentCount}</span>
        </div>
      </div>
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="border border-slate-200 rounded-lg bg-white p-5 mb-4 animate-pulse">
      <div className="h-[17px] bg-slate-200 rounded w-4/5 mb-3" />
      <div className="h-3 bg-slate-200 rounded w-2/5 mb-5" />
      <div className="flex gap-4">
        <div className="h-3 bg-slate-200 rounded w-8" />
        <div className="h-3 bg-slate-200 rounded w-8" />
        <div className="h-3 bg-slate-200 rounded w-8" />
      </div>
    </div>
  )
}
