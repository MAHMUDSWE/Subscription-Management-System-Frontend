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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const organizationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['school', 'coaching', 'academy']),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    monthlyFee: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Monthly fee must be a positive number',
    }),
})

type OrganizationValues = z.infer<typeof organizationSchema>

interface CreateOrganizationFormProps {
    onSuccess: () => void
}

export function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps) {
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<OrganizationValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: '',
            type: 'school',
            description: '',
            address: '',
            monthlyFee: '',
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: api.createOrganization,
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Organization created successfully.',
            })
            queryClient.invalidateQueries({ queryKey: ['organizations'] })
            onSuccess()
        },
        onError: (error) => {
            toast({
                variant: 'destructive',
                title: 'Error',
                description:
                    error instanceof Error ? error.message : 'Failed to create organization',
            })
        },
    })

    async function onSubmit(data: OrganizationValues) {
        const organizationData = {
            ...data,
            monthlyFee: parseFloat(data.monthlyFee),
        }
        mutate(organizationData)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter organization name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select organization type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="school">School</SelectItem>
                                    <SelectItem value="coaching">Coaching</SelectItem>
                                    <SelectItem value="academy">Academy</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter organization description" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter organization address" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="monthlyFee"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Fee</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Enter monthly fee"
                                    step="0.01"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    {isPending ? <Loader2 className='animate-spin' /> : 'Create Organization'}
                </Button>
            </form>
        </Form>
    )
}