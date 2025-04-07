import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { Subscription } from '../subscriptions'
import { Payment } from '../subscriptions/payment-history'

export default function DashboardPage() {
  const { data: subscriptionData } = useQuery<{ items: Subscription[] }>({
    queryKey: ['subscriptions'],
    queryFn: api.getSubscriptions,
  })
  const subscriptions = subscriptionData?.items || []

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: api.getOrganizations,
  })

  const { data: paymentsData } = useQuery<{ items: Payment[] }>({
    queryKey: ['payments'],
    queryFn: api.getPayments,
  })
  const payments = paymentsData?.items || []

  // Calculate statistics
  const totalStudents = subscriptions?.length || 0
  const activeSubscriptions = subscriptions?.filter((sub: Subscription) => sub.status === 'active').length || 0
  const totalRevenue = payments?.reduce((sum: number, payment: Payment) => sum + Number(payment.amount), 0) || 0
  const totalOrganizations = organizations?.length || 0

  // Prepare data for charts
  const subscriptionsByStatus = [
    { name: 'Active', value: subscriptions?.filter((sub: Subscription) => sub.status === 'active').length || 0 },
    { name: 'Pending', value: subscriptions?.filter((sub: Subscription) => sub.status === 'pending').length || 0 },
    { name: 'Cancelled', value: subscriptions?.filter((sub: Subscription) => sub.status === 'cancelled').length || 0 },
    { name: 'Expired', value: subscriptions?.filter((sub: Subscription) => sub.status === 'expired').length || 0 },
  ]

  const revenueByMonth = payments?.reduce((acc: any[], payment: Payment) => {
    const date = new Date(payment.createdAt)
    const month = date.toLocaleString('default', { month: 'short' })
    const existingMonth = acc.find(item => item.month === month)

    if (existingMonth) {
      existingMonth.amount += Number(payment.amount)
    } else {
      acc.push({ month, amount: Number(payment.amount) })
    }

    return acc
  }, []) || []

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subscriptionsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0ea5e9"
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}