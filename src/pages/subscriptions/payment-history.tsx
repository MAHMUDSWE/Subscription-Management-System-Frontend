import { PaginatedResponse } from '@/components/shared/paginated-response'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import * as api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Subscription } from './index'

interface PaymentHistoryProps {
    subscription: Subscription
    open: boolean
    onOpenChange: (open: boolean) => void
}

export type Payment = {
    id: string
    date: string
    amount: number
    method: 'stripe' | 'bkash'
    type: string
    status: string
    subscription: Subscription
    createdAt: string
    updatedAt: string
}

export function PaymentHistory({ subscription, open, onOpenChange }: PaymentHistoryProps) {
    const { data, isLoading } = useQuery<PaginatedResponse<Payment>>({
        queryKey: ['payments', subscription.id],
        queryFn: () => api.getPaymentsBySubscription(subscription.id),
        enabled: open,
    })

    const payments = data?.items || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Payment History</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {isLoading ? (
                        <p className="text-center">Loading payments...</p>
                    ) : payments?.length ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment: Payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.subscription.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>${Number(payment?.amount || 0).toFixed(2)}</TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell>{payment.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center">No payment history available.</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
