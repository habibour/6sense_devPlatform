import client from './client'

export function listPosts({ page, limit } = {}) {
  return client.get('/posts', { params: { page, limit } })
}

export function getPost(id) {
  return client.get(`/posts/${id}`)
}

export function createPost({ title, body }) {
  return client.post('/posts', { title, body })
}
