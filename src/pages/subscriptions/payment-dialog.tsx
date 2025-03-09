import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import * as api from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Subscription } from './index'

const paymentSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
    method: z.enum(['stripe', 'bkash']),
})

export type PaymentValues = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
    subscription: Subscription
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PaymentDialog({ subscription, open, onOpenChange }: PaymentDialogProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<PaymentValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: subscription.amount.toString(),
            method: 'stripe',
        },
    })

    async function onSubmit(data: PaymentValues) {
        try {
            setLoading(true)
            await api.createPayment({
                subscriptionId: subscription.id,
                amount: Number(data.amount),
                method: data.method,
            })

            toast({
                title: 'Success',
                description: 'Payment processed successfully.',
            })

            queryClient.invalidateQueries({ queryKey: ['payments'] })
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            onOpenChange(false)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to process payment',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Payment</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter payment amount"
                                            step="0.01"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="stripe">Stripe</SelectItem>
                                            <SelectItem value="bkash">bKash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Process Payment'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}