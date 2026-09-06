import client from './client'

export function react({ targetType, targetId, type }) {
  return client.post('/reactions', { targetType, targetId, type })
}

export function removeReaction(targetType, targetId) {
  return client.delete(`/reactions/${targetType}/${targetId}`)
}

export function getMyReaction(targetType, targetId) {
  return client.get(`/reactions/me/${targetType}/${targetId}`)
}
