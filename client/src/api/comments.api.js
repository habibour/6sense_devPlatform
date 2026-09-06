import client from './client'

export function listComments(postId) {
  return client.get(`/posts/${postId}/comments`)
}

export function createComment(postId, { body, parentCommentId } = {}) {
  // parentCommentId is only sent when truthy — a top-level comment's request body
  // omits the key entirely rather than sending an explicit null.
  return client.post(`/posts/${postId}/comments`, parentCommentId ? { body, parentCommentId } : { body })
}
