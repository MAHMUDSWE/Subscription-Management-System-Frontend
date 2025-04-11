import { AuthProvider } from '@/providers/auth-provider'
import Router from './router/Router'

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}