import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
      <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-slate-900">
          dev<span className="text-indigo-600">community</span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <Link to="/posts/new" className="text-indigo-600 hover:text-indigo-700 font-medium">
                New post
              </Link>
              <Link to={`/profile/${user.id}`} className="text-slate-600 hover:text-slate-900">
                {user.name}
              </Link>
              <button type="button" onClick={logout} className="text-indigo-600 hover:text-indigo-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-md font-medium hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
