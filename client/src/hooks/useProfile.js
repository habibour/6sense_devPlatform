import { useQuery } from '@tanstack/react-query'
import { getUser } from '../api/users.api'

export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })
}
