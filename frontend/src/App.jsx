/**
 * Main App component with route definitions and protected route logic.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import CitizenDashboard from './pages/CitizenDashboard'

/**
 * ProtectedRoute - Redirects to login if not authenticated.
 * Optionally enforces admin-only access.
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/citizen" replace />

  return children
}

/**
 * RoleRedirect - Redirects authenticated users to their role-specific dashboard.
 */
function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/citizen'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role-based redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin-only routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Citizen routes */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared sub-pages — both roles can access via layout */}
      <Route
        path="/traffic"
        element={
          <ProtectedRoute>
            <AdminDashboard activeTab="traffic" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/waste"
        element={
          <ProtectedRoute>
            <AdminDashboard activeTab="waste" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/energy"
        element={
          <ProtectedRoute>
            <AdminDashboard activeTab="energy" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <AdminDashboard activeTab="alerts" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard activeTab="analytics" />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}