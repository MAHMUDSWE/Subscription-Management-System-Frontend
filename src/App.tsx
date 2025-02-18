import { AuthRoute } from '@/components/auth-route'
import { Layout } from '@/components/layout'
import { ProtectedRoute } from '@/components/protected-route'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import DashboardPage from '@/pages/dashboard'
import OrganizationsPage from '@/pages/organizations'
import SubscriptionsPage from '@/pages/subscriptions'
import { AuthProvider } from '@/providers/auth-provider'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}