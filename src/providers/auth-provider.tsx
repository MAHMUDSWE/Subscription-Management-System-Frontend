import * as api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = JSON.parse(localStorage.getItem('user') || 'null')
          setUser(userData)
        }
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsAuthContextLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { access_token, refresh_token, user } = await api.login({ email, password })
    localStorage.setItem('token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
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
      if (!refreshToken) {
        throw new Error('No refresh token found')
      }
      await api.logout({ refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      queryClient.removeQueries();
      queryClient.cancelQueries();
      navigate('/', { replace: true })
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