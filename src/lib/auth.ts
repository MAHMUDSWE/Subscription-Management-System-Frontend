import { toast } from '@/hooks/use-toast'

interface Tokens {
    accessToken: string
}

// Auth event handlers
type AuthEventHandler = () => void
const authEventHandlers: AuthEventHandler[] = []

export const onAuthEvent = (handler: AuthEventHandler) => {
    authEventHandlers.push(handler)
}

const triggerAuthEvent = () => {
    authEventHandlers.forEach(handler => handler())
}

// Token management
export const getTokens = (): Tokens | null => {
    const accessToken = localStorage.getItem('access_token')
    return accessToken ? { accessToken } : null
}

export const getUser = () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
}

export const setTokens = (tokens: Tokens) => {
    localStorage.setItem('access_token', tokens.accessToken)
}

export const setUser = (user: any) => {
    localStorage.setItem('user', JSON.stringify(user))
}

export const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
}

export const handleAuthSuccess = (tokens: Tokens, user: any) => {
    setTokens(tokens)
    setUser(user)
}

export const handleAuthError = () => {
    clearTokens()
    triggerAuthEvent()
    toast({
        variant: 'destructive',
        title: 'Session Expired',
        description: 'Your session has expired. Please login again.',
    })

    window.location.href = '/login'
}