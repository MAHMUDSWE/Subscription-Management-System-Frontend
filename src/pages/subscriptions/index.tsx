import { PaginatedResponse } from '@/components/shared/paginated-response'
import { PaginationControls } from '@/components/shared/pagination-controls'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useDebounce } from '@/hooks/useDebounce'
import { usePaginationParams } from '@/hooks/usePaginationParams'
import * as api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { CreateSubscriptionForm } from './create-subscription-form'
import { SubscriptionActions } from './subscription-actions'

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
    const [open, setOpen] = useState(false)
    const { page, limit, setPage, setLimit } = usePaginationParams()
    const debouncedPage = useDebounce(page, 300)
    const debouncedLimit = useDebounce(limit, 300)

    const { data, isLoading } = useQuery<PaginatedResponse<Subscription>>({
        queryKey: ['subscriptions', debouncedPage, debouncedLimit],
        queryFn: () => api.getSubscriptions(debouncedPage, debouncedLimit),
    })

    const subscriptions = data?.items || []

    async function handleSuccess() {
        setOpen(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            New Subscription
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Subscription</DialogTitle>
                        </DialogHeader>
                        <CreateSubscriptionForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 w-2/3 bg-gray-200 rounded"></div>
                                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {subscriptions.map((subscription) => (
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
                                            Start Date:{' '}
                                            {new Date(subscription.startDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            End Date:{' '}
                                            {new Date(subscription.endDate).toLocaleDateString()}
                                        </p>
                                        <p className="font-medium">
                                            Amount: ${Number(subscription?.amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <SubscriptionActions subscription={subscription} />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {data?.meta && (
                        <PaginationControls
                            page={page}
                            totalPages={data.meta.lastPage}
                            onPageChange={setPage}
                            limit={limit}
                            onLimitChange={setLimit}
                            isLoading={isLoading}
                            className="mt-4"
                            showPageNumbers={true}
                        />
                    )}
                </>
            )}
        </div>
    )
}