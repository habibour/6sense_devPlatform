import client from './client'

export function react({ targetType, targetId, type }) {
  return client.post('/reactions', { targetType, targetId, type })
}

export function removeReaction(targetType, targetId) {
  return client.delete(`/reactions/${targetType}/${targetId}`)
}

// Backs the "does the current user already have a reaction on this?" check that keeps
// like/dislike highlight state accurate across reloads/navigation (see phase-2 spec F5).
export function getMyReaction(targetType, targetId) {
  return client.get(`/reactions/me/${targetType}/${targetId}`)
}
