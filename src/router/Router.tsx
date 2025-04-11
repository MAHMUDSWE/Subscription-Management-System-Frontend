import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import DashboardPage from '@/pages/dashboard'
import ErrorPage from '@/pages/error'
import OrganizationsPage from '@/pages/organizations'
import SubscriptionsPage from '@/pages/subscriptions'
import { useAuth } from '@/providers/auth-provider'
import { AuthRoute } from '@/router/auth-route'
import { Loader2 } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './protected-route'

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
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
            </Route>

            {/* Error Routes */}
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    )
}