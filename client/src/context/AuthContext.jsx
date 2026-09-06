import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginApi, register as registerApi } from '../api/auth.api'
import { setAuthToken } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    setAuthToken(auth?.accessToken ?? null)
  }, [auth])

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
