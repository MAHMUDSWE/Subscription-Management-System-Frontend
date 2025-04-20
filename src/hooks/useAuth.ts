import { clearTokens, getTokens, getUser, onAuthEvent, setTokens, setUser } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useAuthManagement = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    useEffect(() => {
        const handler = () => {
            queryClient.clear()
            navigate('/login', { replace: true })
        }

        onAuthEvent(handler)

        return () => {
            // Cleanup if needed
        }
    }, [navigate, queryClient])

    const handleLogout = () => {
        clearTokens()
        queryClient.clear()
        navigate('/login', { replace: true })
    }

    return {
        getTokens,
        getUser,
        setTokens,
        setUser,
        clearTokens,
        handleLogout
    }
}