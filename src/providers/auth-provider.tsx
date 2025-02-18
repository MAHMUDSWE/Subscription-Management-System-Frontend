import * as api from '@/lib/api'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const userData = JSON.parse(localStorage.getItem('user') || 'null')
      setUser(userData)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { access_token, user } = await api.login({ email, password })
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    navigate('/')
  }

  const signUp = async (email: string, password: string) => {
    await api.register({ email, password })
    navigate('/login')
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
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