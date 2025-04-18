import { toast } from '@/hooks/use-toast'
import { Organization } from '@/pages/organizations'
import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token!)
        }
    })

    failedQueue = []
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const isUnauthorized = error.response?.status === 401
        const isLoginRequest = originalRequest.url === '/login'
        const isRefreshRequest = originalRequest.url === '/refresh'
        const isOnLoginPage = window.location.pathname === '/login'

        if (isUnauthorized && !isLoginRequest && !isRefreshRequest && !isOnLoginPage) {
            if (!isRefreshing) {
                isRefreshing = true

                try {
                    const storedRefreshToken = localStorage.getItem('refresh_token')
                    const response = await axios.post('/api/auth/refresh', {
                        refreshToken: storedRefreshToken,
                    })
                    const { access_token, refresh_token } = response.data

                    localStorage.setItem('token', access_token)
                    localStorage.setItem('refresh_token', refresh_token)

                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                    processQueue(null, access_token)

                    return api(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    localStorage.removeItem('token')
                    localStorage.removeItem('refresh_token')
                    localStorage.removeItem('user')

                    toast({
                        variant: 'destructive',
                        title: 'Session Expired',
                        description: 'Your session has expired. Please login again.',
                    })
                    window.location.href = '/login'
                    return Promise.reject(refreshError)
                } finally {
                    isRefreshing = false
                }
            }

            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                })
                .catch((err) => {
                    return Promise.reject(err)
                })
        }

        return Promise.reject(error)
    }
)

// Organizations
export const getOrganizations = (page?: number, limit?: number) =>
    api.get('/organizations', { params: { page, limit } }).then((res) => res.data)
export const createOrganization = (data: {
    name: string
    type: string
    description: string
    address: string
    monthlyFee: number
}) => api.post('/organizations', data).then((res) => res.data)

export const updateOrganization = async (data: Organization) => {
    const { id, ...body } = data
    const res = await api.put(`/organizations/${id}`, body)
    return res.data
}

// Subscriptions
export const getSubscriptions = (page?: number, limit?: number) =>
    api.get('/subscriptions', { params: { page, limit } }).then((res) => res.data)

export const createSubscription = (data: {
    organizationId: string
    amount: number
}) => api.post('/subscriptions', data).then((res) => res.data)
export const cancelSubscription = (id: string) =>
    api.post(`/subscriptions/${id}/cancel`).then((res) => res.data)
export const renewSubscription = (id: string) =>
    api.post(`/subscriptions/${id}/renew`).then((res) => res.data)

// Payments
export const createPayment = (data: {
    subscriptionId: string
    amount: number
    method: 'stripe' | 'bkash'
}) => api.post('/payments', data).then((res) => res.data)
export const getPayments = () => api.get('/payments').then((res) => res.data)
export const getPaymentsBySubscription = (subscriptionId: string) =>
    api.get(`/payments/subscription/${subscriptionId}`).then((res) => res.data)

// Auth
export const login = (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((res) => res.data)
export const register = (data: { email: string; password: string, firstName: string, lastName: string }) =>
    api.post('/users', data).then((res) => res.data)
export const logout = (data: { refreshToken: string }) => api.post('/auth/logout', data).then((res) => res.data)

export const refreshToken = (data: { refreshToken: string | null }) =>
    api.post('/auth/refresh', data).then((res) => res.data)