import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, Plus, UserCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.svg'

function AvatarMenu({ user, logout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Listener is only attached while open (not on every mount) so idle navbars don't pay
  // for a document-wide listener. mousedown (not click) so the outside-press is caught
  // at the start of the interaction, before whatever else the press targets handles it.
  useEffect(() => {
    if (!open) return undefined
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5">
        <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
          {user.name.slice(0, 2).toUpperCase()}
        </span>
        <ChevronDown size={14} className={`text-chrome-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-chrome-0 border border-chrome-200 rounded-lg shadow-lg py-1 text-sm z-20">
          <Link
            to={`/profile/${user.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-chrome-700 hover:bg-chrome-50"
          >
            <UserCircle size={16} />
            My Profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-chrome-700 hover:bg-chrome-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <div className="sticky top-0 bg-chrome-0 border-b border-chrome-200 z-10">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-chrome-900 whitespace-nowrap flex-shrink-0">
          <img src={logo} alt="" className="w-7 h-7" />
          dev<span className="text-brand-500">community</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 text-sm min-w-0">
          {user ? (
            <>
              <Link
                to="/posts/new"
                className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 transition-colors"
              >
                <Plus size={15} />
                <span className="hidden sm:inline">New post</span>
              </Link>
              <AvatarMenu user={user} logout={logout} />
            </>
          ) : (
            <>
              <Link to="/login" className="text-chrome-600 hover:text-chrome-900 whitespace-nowrap flex-shrink-0">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand-500 text-white px-3.5 py-1.5 rounded-full font-medium hover:bg-brand-600 whitespace-nowrap flex-shrink-0 transition-colors"
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
