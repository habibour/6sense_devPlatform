import { useQuery } from '@tanstack/react-query'
import { listPosts } from '../api/posts.api'

export function usePostsList(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => listPosts(params),
  })
}
