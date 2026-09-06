import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ThumbsDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMyReaction, useReact } from '../../hooks/useReactions'

export function ReactionButtons({
  targetType,
  targetId,
  likeCount,
  dislikeCount,
  invalidateKeys,
  size = 'md',
  orientation = 'horizontal',
}) {
  const { user } = useAuth()
  const { data: existingReaction } = useMyReaction({ targetType, targetId, enabled: !!user })
  const { addReaction, removeReaction } = useReact({ targetType, targetId, invalidateKeys })

  // myReaction is local state (not derived directly from existingReaction) so a click
  // can flip the button instantly instead of waiting on the mutation + refetch round
  // trip. But that means it needs to be reset whenever the *real* server data changes
  // underneath it — logging out, switching target, or the query resolving for the
  // first time. Calling setState during render (React's documented "adjusting state
  // when props change" pattern) rather than a useEffect does that reset in the same
  // render the new data arrives in, avoiding a one-frame flash of stale state that an
  // effect (which runs after paint) would produce.
  const [myReaction, setMyReaction] = useState(null)
  const [syncedUser, setSyncedUser] = useState(user)
  const [syncedReaction, setSyncedReaction] = useState(existingReaction)

  if (user !== syncedUser || existingReaction !== syncedReaction) {
    setSyncedUser(user)
    setSyncedReaction(existingReaction)
    setMyReaction(user && existingReaction ? existingReaction.type ?? null : null)
  }

  const pending = addReaction.isPending || removeReaction.isPending
  const iconSize = size === 'sm' ? 14 : 16
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const vertical = orientation === 'vertical'

  const handleClick = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || pending) return

    if (myReaction === type) {
      removeReaction.mutate(undefined, { onSuccess: () => setMyReaction(null) })
    } else {
      addReaction.mutate(type, { onSuccess: () => setMyReaction(type) })
    }
  }

  const likeActive = myReaction === 'LIKE'
  const dislikeActive = myReaction === 'DISLIKE'
  const buttonShape = vertical ? 'flex-col p-1' : `${textSize} font-medium px-1.5 py-0.5 -mx-1.5`
  const countSize = vertical ? 'text-xs' : textSize

  return (
    <div className={vertical ? 'flex flex-col items-center gap-0.5' : 'flex items-center gap-3'}>
      <button
        type="button"
        onClick={(e) => handleClick(e, 'LIKE')}
        disabled={!user || pending}
        aria-pressed={likeActive}
        className={`inline-flex items-center gap-1 rounded-full transition-colors disabled:cursor-not-allowed ${buttonShape} ${
          likeActive ? 'text-like' : 'text-chrome-400'
        } enabled:hover:bg-red-50 enabled:hover:text-like`}
      >
        <Heart size={iconSize} fill={likeActive ? 'currentColor' : 'none'} />
        {/* Like/dislike counts render separately rather than a single net score — the
            API and spec (F5) expose both counts independently, and collapsing them
            would hide real dislike activity. */}
        <span className={`font-mono ${countSize}`}>{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={(e) => handleClick(e, 'DISLIKE')}
        disabled={!user || pending}
        aria-pressed={dislikeActive}
        className={`inline-flex items-center gap-1 rounded-full transition-colors disabled:cursor-not-allowed ${buttonShape} ${
          dislikeActive ? 'text-dislike' : 'text-chrome-400'
        } enabled:hover:bg-brand-50 enabled:hover:text-dislike`}
      >
        <ThumbsDown size={iconSize} fill={dislikeActive ? 'currentColor' : 'none'} />
        <span className={`font-mono ${countSize}`}>{dislikeCount}</span>
      </button>

      {!user &&
        (vertical ? (
          <Link
            to="/login"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] leading-tight text-center text-brand-600 hover:text-brand-700 mt-0.5"
          >
            Log in
          </Link>
        ) : (
          <Link
            to="/login"
            onClick={(e) => e.stopPropagation()}
            className={`${textSize} text-brand-600 hover:text-brand-700`}
          >
            Log in to react
          </Link>
        ))}
    </div>
  )
}
