import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}