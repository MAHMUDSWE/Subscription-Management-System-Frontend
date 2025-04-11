import { useAuth } from '@/providers/auth-provider'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Layout } from '../components/layout'

export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Layout><Outlet /></Layout>
}