import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPost, getPost, listPosts } from '../api/posts.api'

export function usePostsList(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => listPosts(params),
  })
}

export function usePost(id) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => getPost(id),
    enabled: Boolean(id),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
