import { toast } from '@/hooks/use-toast'

interface Tokens {
    accessToken: string
    refreshToken: string
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
    const accessToken = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refresh_token')
    return accessToken && refreshToken ? { accessToken, refreshToken } : null
}

export const setTokens = (tokens: Tokens) => {
    localStorage.setItem('token', tokens.accessToken)
    localStorage.setItem('refresh_token', tokens.refreshToken)
}

export const clearTokens = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
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