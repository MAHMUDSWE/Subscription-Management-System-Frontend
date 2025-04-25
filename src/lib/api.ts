import { Organization } from '@/pages/organizations'
import axios from 'axios'
import { getTokens, handleAuthError, setTokens } from './auth'

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
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
    const tokens = getTokens()
    if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const isUnauthorized = error.response?.status === 401
        const isLoginRequest = originalRequest.url === '/auth/login'
        const isRefreshRequest = originalRequest.url === '/auth/refresh'

        if (isUnauthorized && !isLoginRequest && !isRefreshRequest) {
            if (!isRefreshing) {
                isRefreshing = true

                try {
                    const response = await axios.post('/api/auth/refresh', {
                    }, { withCredentials: true }
                    )
                    const { access_token } = response.data

                    setTokens({ accessToken: access_token })

                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                    processQueue(null, access_token)

                    return api(originalRequest)
                } catch (refreshError) {
                    processQueue(refreshError, null)
                    handleAuthError()
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
                .catch((err) => Promise.reject(err))
        }

        return Promise.reject(error)
    }
)

// Auth
export const login = (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then((res) => res.data)

export const register = (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/users', data).then((res) => res.data)

export const logout = () =>
    api.post('/auth/logout').then((res) => res.data)

export const refreshToken = (data: { refreshToken: string | null }) =>
    api.post('/auth/refresh', data).then((res) => res.data)

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