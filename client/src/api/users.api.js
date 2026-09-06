import client from './client'

export function getMe() {
  return client.get('/users/me')
}

export function getUser(id) {
  return client.get(`/users/${id}`)
}

export function updateMe({ name, bio } = {}) {
  return client.patch('/users/me', { name, bio })
}

export function updateSkills(skills) {
  return client.put('/users/me/skills', { skills })
}

export function addExperience(experience) {
  return client.post('/users/me/experiences', experience)
}

export function updateExperience(experienceId, experience) {
  return client.patch(`/users/me/experiences/${experienceId}`, experience)
}

export function deleteExperience(experienceId) {
  return client.delete(`/users/me/experiences/${experienceId}`)
}
