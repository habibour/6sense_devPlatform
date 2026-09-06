import client from './client'

export function listPosts({ page, limit } = {}) {
  // axios drops undefined params from the query string, so calling this with no
  // args still hits GET /posts (no page/limit) rather than /posts?page=undefined.
  return client.get('/posts', { params: { page, limit } })
}

export function getPost(id) {
  return client.get(`/posts/${id}`)
}

export function createPost({ title, body }) {
  return client.post('/posts', { title, body })
}
