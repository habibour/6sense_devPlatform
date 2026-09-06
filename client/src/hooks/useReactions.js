import { useMutation, useQueryClient } from '@tanstack/react-query'
import { react, removeReaction } from '../api/reactions.api'

export function useReact({ targetType, targetId, invalidateKeys }) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
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
