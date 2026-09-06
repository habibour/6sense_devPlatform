import { Link } from 'react-router-dom'
import { Home, Plus, UserCircle, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function LeftRail() {
  const { user } = useAuth()

  return (
    // Only real routes here — no fake "Popular"/"All" nav items, since this app has no
    // community/subreddit concept for them to point to.
    <nav className="hidden md:flex flex-col gap-1 sticky top-20 self-start">
      <Link
        to="/"
        className="flex items-center gap-2.5 px-3 py-2 rounded-full text-sm font-medium text-chrome-700 hover:bg-chrome-100"
      >
        <Home size={18} />
        Home
      </Link>
      {user && (
        <Link
          to={`/profile/${user.id}`}
          className="flex items-center gap-2.5 px-3 py-2 rounded-full text-sm font-medium text-chrome-700 hover:bg-chrome-100"
        >
          <UserCircle size={18} />
          My Profile
        </Link>
      )}
    </nav>
  )
}

function RightSidebar() {
  const { user } = useAuth()

  return (
    // Static copy sourced from the app's own README description — deliberately no
    // invented member counts or "online now" widgets.
    <aside className="hidden lg:block sticky top-20 self-start">
      <div className="bg-chrome-0 border border-chrome-200 rounded-lg overflow-hidden">
        <div className="bg-brand-500 px-4 py-3 flex items-center gap-2 text-white">
          <Users size={16} />
          <span className="text-sm font-semibold">About DevCommunity</span>
        </div>
        <div className="p-4">
          <p className="text-sm text-chrome-600 leading-relaxed mb-4">
            A developer community app — posts, threaded comments, like/dislike reactions, a ranked
            feed, and developer profiles.
          </p>
          {user ? (
            <Link
              to="/posts/new"
              className="flex items-center justify-center gap-1.5 w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-full py-2 transition-colors"
            >
              <Plus size={16} />
              Create Post
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full border border-brand-500 text-brand-600 hover:bg-brand-50 text-sm font-semibold rounded-full py-2 transition-colors"
            >
              Log in to post
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}

export function AppShell({ children }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,640px)_300px] gap-6 px-4 py-6">
      <LeftRail />
      <main className="min-w-0">{children}</main>
      <RightSidebar />
    </div>
  )
}
