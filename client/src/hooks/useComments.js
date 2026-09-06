import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createComment, listComments } from '../api/comments.api'

export function useComments(postId) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => listComments(postId),
    enabled: Boolean(postId),
  })
}

export function useCreateComment(postId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ body, parentCommentId }) => createComment(postId, { body, parentCommentId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}
