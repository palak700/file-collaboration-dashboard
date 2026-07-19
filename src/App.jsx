import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  const canManage = user.role === 'superadmin' || user.role === 'department_manager'
  if (adminOnly && !canManage) return <Navigate to="/user/dashboard" replace />
  if (!adminOnly && canManage) return <Navigate to="/admin/dashboard" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/*"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate
            to={
              user?.role === 'superadmin' || user?.role === 'department_manager'
                ? '/admin/dashboard'
                : user
                  ? '/user/dashboard'
                  : '/login'
            }
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
