import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function HomePlaceholder() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          dev<span className="text-indigo-600">community</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500">Feed comes in Step 4.</p>
        {user ? (
          <div className="mt-4 text-sm text-slate-700">
            Logged in as <span className="font-medium">{user.name}</span>{' '}
            <button onClick={logout} className="ml-2 text-indigo-600 hover:text-indigo-700">
              Logout
            </button>
          </div>
        ) : (
          <div className="mt-4 text-sm">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Login</Link>
            {' · '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700">Register</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
