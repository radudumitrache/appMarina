import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="page-suspense-fallback" />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }
  return children
}
