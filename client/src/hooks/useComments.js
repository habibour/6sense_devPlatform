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
      // Both caches need invalidating: the comment list obviously changed, and the
      // post's own commentCount (denormalized on Post, used for ranking) is stale too.
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      queryClient.invalidateQueries({ queryKey: ['posts', postId] })
    },
  })
}
