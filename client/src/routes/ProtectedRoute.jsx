import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// A layout route (rendered via <Route element={<ProtectedRoute/>}> wrapping child
// <Route>s in App.jsx) rather than wrapping each protected page individually — one
// guard covers every nested route, and new protected routes just nest under it.
// Redirects (rather than rendering an "unauthorized" message in place) since an
// unauthenticated visitor has no legitimate reason to see this URL at all.
export default function ProtectedRoute() {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
