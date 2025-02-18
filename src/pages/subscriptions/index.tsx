import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import * as api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'

export type Subscription = {
    id: string
    organizationId: string
    userId: string
    status: 'pending' | 'active' | 'cancelled' | 'expired'
    startDate: string
    endDate: string
    amount: number
    createdAt: string
    updatedAt: string
    organization: {
        name: string
        type: string
    }
}

export default function SubscriptionsPage() {
    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: api.getSubscriptions,
    })

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Subscription
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions?.map((subscription: any) => (
                    <Card key={subscription.id}>
                        <CardHeader>
                            <CardTitle>{subscription.organization.name}</CardTitle>
                            <CardDescription>
                                {subscription.organization.type} - {subscription.status}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm">
                                    Start Date: {new Date(subscription.startDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm">
                                    End Date: {new Date(subscription.endDate).toLocaleDateString()}
                                </p>
                                <p className="font-medium">
                                    Amount: ${Number(subscription?.amount || 0).toFixed(2)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}