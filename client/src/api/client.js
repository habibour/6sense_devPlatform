import axios from 'axios'

export class ApiClientError extends Error {
  constructor(statusCode, message, errors) {
    super(message)
    this.name = 'ApiClientError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

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
  (response) => response.data.data,
  (error) => {
    if (error.response) {
      const { statusCode, message, errors } = error.response.data
      return Promise.reject(new ApiClientError(statusCode, message, errors))
    }
    return Promise.reject(new ApiClientError(0, 'Network error — could not reach the server'))
  },
)

export default client
