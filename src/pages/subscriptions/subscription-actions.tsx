import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import * as api from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Subscription } from './index'
import { PaymentDialog } from './payment-dialog'
import { PaymentHistory } from './payment-history'

interface SubscriptionActionsProps {
    subscription: Subscription
}

export function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const handleCancel = async () => {
        try {
            setLoading(true)
            await api.cancelSubscription(subscription.id)
            await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            toast({
                title: 'Success',
                description: 'Subscription cancelled successfully.',
            })
            setIsDialogOpen(false)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to cancel subscription',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRenew = async () => {
        try {
            setLoading(true)
            await api.renewSubscription(subscription.id)
            await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            toast({
                title: 'Success',
                description: 'Subscription renewed successfully.',
            })
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to renew subscription',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {subscription.status === 'active' && (
                        <>
                            <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)}>
                                Process Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                                Cancel Subscription
                            </DropdownMenuItem>
                        </>
                    )}
                    {(subscription.status === 'cancelled' || subscription.status === 'expired') && (
                        <DropdownMenuItem onClick={handleRenew}>
                            Renew Subscription
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setIsPaymentHistoryOpen(true)}>
                        View Payments
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this subscription? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            {loading ? 'Cancelling...' : 'Yes, cancel subscription'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <PaymentDialog
                subscription={subscription}
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
            />

            <PaymentHistory
                subscription={subscription}
                open={isPaymentHistoryOpen}
                onOpenChange={setIsPaymentHistoryOpen}
            />
        </>
    )
}