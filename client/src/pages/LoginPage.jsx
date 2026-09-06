import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-6">
        <h1 className="text-lg font-semibold text-slate-900 mb-4">Log in</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 text-white rounded px-3 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>

        <p className="mt-4 text-sm text-slate-500 text-center">
          No account?{' '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}
