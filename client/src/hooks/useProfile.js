import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addExperience,
  deleteExperience,
  getUser,
  updateExperience,
  updateSkills,
} from '../api/users.api'

export function useUser(id) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  })
}

export function useSkills(userId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSkills,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', userId] }),
  })
}

export function useExperiences(userId) {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users', userId] })

  const add = useMutation({
    mutationFn: addExperience,
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: ({ experienceId, ...data }) => updateExperience(experienceId, data),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: deleteExperience,
    onSuccess: invalidate,
  })

  return { add, update, remove }
}
