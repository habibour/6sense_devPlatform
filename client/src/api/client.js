import axios from 'axios'

export class ApiClientError extends Error {
  constructor(statusCode, message, errors) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

// Held in module scope rather than React state: the axios request interceptor below
// needs synchronous, non-hook access to the current token, and this module is imported
// by AuthContext (which calls setAuthToken on login/logout/boot) as well as every
// api/*.js file, so it acts as the single place the token actually lives.
let authToken = null

export function setAuthToken(token) {
  authToken = token
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

client.interceptors.response.use(
  // Every backend response uses the { success, data } envelope (see CLAUDE.md) — unwrap
  // it here once so every api/*.js call site gets the resource directly, not the envelope.
  (response) => response.data.data,
  (error) => {
    if (error.response) {
      const { statusCode, message, errors } = error.response.data
      return Promise.reject(new ApiClientError(statusCode, message, errors))
    }
    // No error.response means the request never reached the server (network/CORS
    // failure) — the backend's own error envelope shape doesn't apply here.
    return Promise.reject(new ApiClientError(0, 'Network error — could not reach the server'))
  },
)

export default client
