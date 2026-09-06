import { EmptyState } from '../components/common/EmptyState'
import { ErrorBanner } from '../components/common/ErrorBanner'
import { PostCard, PostCardSkeleton } from '../components/posts/PostCard'
import { usePostsList } from '../hooks/usePosts'

export default function FeedPage() {
  const { data, isPending, isError, error } = usePostsList()

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-4">
        Top Posts
      </div>

      {isPending && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {!isPending && isError && <ErrorBanner title="Failed to load posts" message={error.message} />}

      {!isPending && !isError && data.posts.length === 0 && (
        <EmptyState title="No posts yet" description="Be the first to share something." />
      )}

      {!isPending &&
        !isError &&
        data.posts.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
