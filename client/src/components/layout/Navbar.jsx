import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="font-bold text-slate-900 whitespace-nowrap flex-shrink-0">
          dev<span className="text-indigo-600">community</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-5 text-sm min-w-0">
          {user ? (
            <>
              <Link to="/posts/new" className="text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap flex-shrink-0">
                New post
              </Link>
              <Link to={`/profile/${user.id}`} className="text-slate-600 hover:text-slate-900 truncate max-w-[4.5rem] sm:max-w-none">
                {user.name}
              </Link>
              <button type="button" onClick={logout} className="text-indigo-600 hover:text-indigo-700 whitespace-nowrap flex-shrink-0">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900 whitespace-nowrap flex-shrink-0">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-3.5 py-1.5 rounded-md font-medium hover:bg-indigo-700 whitespace-nowrap flex-shrink-0"
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
