import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMyReaction, useReact } from '../../hooks/useReactions'

export function ReactionButtons({ targetType, targetId, likeCount, dislikeCount, invalidateKeys, size = 'md' }) {
  const { user } = useAuth()
  const { data: existingReaction } = useMyReaction({ targetType, targetId, enabled: !!user })
  const { addReaction, removeReaction } = useReact({ targetType, targetId, invalidateKeys })

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

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={(e) => handleClick(e, 'LIKE')}
        disabled={!user || pending}
        className={`inline-flex items-center gap-1 ${textSize} font-medium rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${
          myReaction === 'LIKE' ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-600'
        } enabled:hover:bg-emerald-50 disabled:cursor-not-allowed`}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span className="font-mono">{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={(e) => handleClick(e, 'DISLIKE')}
        disabled={!user || pending}
        className={`inline-flex items-center gap-1 ${textSize} font-medium rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${
          myReaction === 'DISLIKE' ? 'text-red-600 bg-red-50' : 'text-red-600'
        } enabled:hover:bg-red-50 disabled:cursor-not-allowed`}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
        <span className="font-mono">{dislikeCount}</span>
      </button>

      {!user && (
        <Link
          to="/login"
          onClick={(e) => e.stopPropagation()}
          className={`${textSize} text-indigo-600 hover:text-indigo-700`}
        >
          Log in to react
        </Link>
      )}
    </div>
  )
}
