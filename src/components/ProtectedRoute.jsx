import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// requireAdmin=true restricts the route to admin-role users only.
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-charcoal text-sand">Loading…</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/portal" replace />

  return children
}
