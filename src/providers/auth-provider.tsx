import { useAuthManagement } from '@/hooks/useAuth'
import * as api from '@/lib/api'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthContextLoading: boolean
  setIsAuthContextLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthContextLoading, setIsAuthContextLoading] = useState(true)
  const { setTokens, clearTokens, handleLogout } = useAuthManagement()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || 'null')
          setUser(userData)
        }
      } catch (error) {
        clearTokens()
        setUser(null)
      } finally {
        setIsAuthContextLoading(false)
      }
    }

    initializeAuth()
  }, [clearTokens])

  const signIn = async (email: string, password: string) => {
    const { access_token, refresh_token, user } = await api.login({ email, password })
    setTokens({ accessToken: access_token, refreshToken: refresh_token })
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)

    const intendedPath = location.state?.from?.pathname || '/dashboard'
    navigate(intendedPath, { replace: true })
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    await api.register({ email, password, firstName, lastName })
    navigate('/login')
  }

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await api.logout({ refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      handleLogout()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, isAuthContextLoading, setIsAuthContextLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}