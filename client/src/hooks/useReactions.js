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
