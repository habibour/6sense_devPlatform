import client from './client'

export function listComments(postId) {
  return client.get(`/posts/${postId}/comments`)
}

export function createComment(postId, { body, parentCommentId } = {}) {
  return client.post(`/posts/${postId}/comments`, parentCommentId ? { body, parentCommentId } : { body })
}
