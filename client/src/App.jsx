import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import NewPostPage from './pages/NewPostPage'
import PostDetailPage from './pages/PostDetailPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './routes/ProtectedRoute'

function TempHeader() {
  const { user, logout } = useAuth()

  return (
    <div className="border-b border-slate-200 bg-white px-6 py-3 flex justify-between items-center text-sm">
      <span className="font-bold">
        dev<span className="text-indigo-600">community</span>
      </span>
      {user ? (
        <span className="text-slate-600">
          <Link to="/posts/new" className="text-indigo-600 hover:text-indigo-700 mr-3">New post</Link>
          {user.name}{' '}
          <button onClick={logout} className="ml-2 text-indigo-600 hover:text-indigo-700">
            Logout
          </button>
        </span>
      ) : (
        <span>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700">Login</Link>
          {' · '}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-700">Register</Link>
        </span>
      )}
    </div>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TempHeader />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/new" element={<NewPostPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
