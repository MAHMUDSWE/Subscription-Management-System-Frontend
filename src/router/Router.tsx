import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import DashboardPage from '@/pages/dashboard'
import ErrorPage from '@/pages/error'
import OrganizationsPage from '@/pages/organizations'
import SubscriptionsPage from '@/pages/subscriptions'
import { useAuth } from '@/providers/auth-provider'
import { AuthRoute } from '@/router/auth-route'
import { ProtectedRoute } from '@/router/protected-route'
import { Loader2 } from 'lucide-react'
import { Route, Routes } from 'react-router-dom'

export default function Router() {

    const { isAuthContextLoading } = useAuth()

    if (isAuthContextLoading) {
        return (
            <div role="status" className="h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin" size={44} />
            </div>
        )
    }

    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthRoute />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route
                path="/dashboard"
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
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    )
}