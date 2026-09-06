import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginApi, register as registerApi } from '../api/auth.api'
import { setAuthToken } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'auth'

export function AuthProvider({ children }) {
  // Lazy initializer reads localStorage once on mount so a page refresh restores the
  // session instead of bouncing to logged-out; the try/catch guards against corrupted
  // or manually-edited storage (JSON.parse throwing) rather than crashing the app.
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Keeps the axios client's module-scope token (see api/client.js) in sync with React
  // state — runs on mount too, so a refreshed page re-attaches the token before any
  // authenticated request fires.
  useEffect(() => {
    setAuthToken(auth?.accessToken ?? null)
  }, [auth])

  // Login/register both write through this: update in-memory state for immediate
  // re-render, and localStorage so the session survives a refresh.
  const persist = (data) => {
    setAuth(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const login = async (email, password) => {
    const data = await loginApi({ email, password })
    persist(data)
  }

  const register = async (name, email, password) => {
    const data = await registerApi({ name, email, password })
    persist(data)
  }

  const logout = () => {
    setAuth(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = {
    user: auth?.user ?? null,
    token: auth?.accessToken ?? null,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
