import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyReaction, react, removeReaction } from '../api/reactions.api'

export function useMyReaction({ targetType, targetId, enabled }) {
  return useQuery({
    queryKey: ['myReaction', targetType, targetId],
    queryFn: () => getMyReaction(targetType, targetId),
    enabled: Boolean(enabled && targetType && targetId),
  })
}

export function useReact({ targetType, targetId, invalidateKeys }) {
  const queryClient = useQueryClient()

  // invalidateKeys is caller-supplied because the same reaction affects different
  // cached queries depending on where it's rendered from: a post-card reaction
  // invalidates the ['posts'] list, a comment reaction invalidates ['comments', postId]
  // — this hook has no way to know which without the caller telling it. myReaction
  // itself is always invalidated here since every reaction affects exactly one.
  const invalidate = () => {
    invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
    queryClient.invalidateQueries({ queryKey: ['myReaction', targetType, targetId] })
  }

  const addReaction = useMutation({
    mutationFn: (type) => react({ targetType, targetId, type }),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: () => removeReaction(targetType, targetId),
    onSuccess: invalidate,
  })

  return { addReaction, removeReaction: removeMutation }
}
