import { useAuth } from '@/providers/auth-provider'
import { Navigate, Outlet } from 'react-router-dom'
import { Layout } from './layout'

export function AuthRoute() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return <Layout><Outlet /></Layout>
}