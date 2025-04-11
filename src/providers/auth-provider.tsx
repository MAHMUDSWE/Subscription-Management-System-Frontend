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
  signOut: () => void
  isAuthContextLoading: boolean
  setIsAuthContextLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [isAuthContextLoading, setIsAuthContextLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || 'null')
          setUser(userData)
        }
      } catch (error) {
        // If there's any error reading from localStorage, clear the auth state
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsAuthContextLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { access_token, user } = await api.login({ email, password })
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)

    // Navigate to the intended page or dashboard
    const intendedPath = location.state?.from?.pathname || '/dashboard'
    navigate(intendedPath, { replace: true })
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    await api.register({ email, password, firstName, lastName })
    navigate('/login')
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/', { replace: true })
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