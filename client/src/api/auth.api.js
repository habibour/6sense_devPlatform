import client from './client'

export function register({ name, email, password }) {
  return client.post('/auth/register', { name, email, password })
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password })
}
