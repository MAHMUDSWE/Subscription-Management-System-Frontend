import { useAuth } from '@/providers/auth-provider'
import { Navigate, useLocation } from 'react-router-dom'
import { Layout } from './layout'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <Layout>{children}</Layout>
}