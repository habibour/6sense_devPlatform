import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import FeedPage from './pages/FeedPage'
import LoginPage from './pages/LoginPage'
import NewPostPage from './pages/NewPostPage'
import NotFoundPage from './pages/NotFoundPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-chrome-50">
      {/* Navbar sits outside <Routes> so it persists across navigation instead of
          remounting per page. */}
      <Navbar />
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/posts/new" element={<NewPostPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
