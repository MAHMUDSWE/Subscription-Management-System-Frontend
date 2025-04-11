import { toast } from '@/hooks/use-toast'
import { Organization } from '@/pages/organizations'
import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear local storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // Show toast message
            toast({
                variant: "destructive",
                title: "Session Expired",
                description: "Your session has expired. Please login again.",
            })

            // Redirect to login page
            window.location.href = '/login'
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