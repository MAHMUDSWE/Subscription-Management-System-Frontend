import { Navigate } from 'react-router-dom'
import { useAuth } from '@/providers/auth-provider'

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}