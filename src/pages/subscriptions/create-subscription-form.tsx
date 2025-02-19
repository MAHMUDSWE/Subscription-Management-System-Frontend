import { Button } from '@/components/ui/button'
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
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const subscriptionSchema = z.object({
    organizationId: z.string().min(1, 'Organization is required'),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Amount must be a positive number',
    }),
})

type SubscriptionValues = z.infer<typeof subscriptionSchema>

interface CreateSubscriptionFormProps {
    onSuccess: () => void
    organizations: { id: string; name: string }[]
}

export function CreateSubscriptionForm({ onSuccess, organizations }: CreateSubscriptionFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<SubscriptionValues>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            organizationId: '',
            amount: '',
        },
    })

    async function onSubmit(data: SubscriptionValues) {
        try {
            await api.createSubscription({
                ...data,
                amount: Number(data.amount),
            })

            toast({
                title: 'Success',
                description: 'Subscription created successfully.',
            })

            queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
            onSuccess()
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create subscription',
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Organization</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an organization" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {organizations.map((org) => (
                                        <SelectItem key={org.id} value={org.id}>
                                            {org.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter amount" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Create Subscription
                </Button>
            </form>
        </Form>
    )
}