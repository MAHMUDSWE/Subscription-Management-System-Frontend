import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { AuthProvider } from '@/providers/auth-provider'
import { ProtectedRoute } from '@/components/protected-route'
import { AuthRoute } from '@/components/auth-route'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import DashboardPage from '@/pages/dashboard'

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
                <div>Organizations Page</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute>
                <div>Subscriptions Page</div>
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