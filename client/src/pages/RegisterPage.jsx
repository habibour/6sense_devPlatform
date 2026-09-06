import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.svg'

// Same local-state approach as LoginPage; minLength={6} on the password input mirrors
// the backend's own minimum (see auth validator) so bad input is rejected before a
// round trip, but the backend still re-validates — this is a UX shortcut, not the
// source of truth.
export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] bg-brand-50 px-4 py-16">
      <img src={logo} alt="DevCommunity" className="w-12 h-12 mb-4" />
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-chrome-0 border border-chrome-200 rounded-xl shadow-sm p-6">
        <h1 className="text-lg font-semibold text-chrome-900 mb-4">Create an account</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-chrome-700 mb-1" htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 border border-chrome-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <label className="block text-sm font-medium text-chrome-700 mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 border border-chrome-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <label className="block text-sm font-medium text-chrome-700 mb-1" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 border border-chrome-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-500 text-white rounded-full px-3 py-2 text-sm font-medium hover:bg-brand-600 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Register'}
        </button>

        <p className="mt-4 text-sm text-chrome-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}
