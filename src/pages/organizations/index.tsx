import { PaginationControls } from '@/components/shared/pagination-controls'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { CreateOrganizationForm } from './create-organization-form'
import EditOrganization from './edit-organization'

export type Organization = {
  id: string
  name: string
  type: 'school' | 'coaching' | 'academy'
  description: string
  address: string
  monthlyFee: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function OrganizationsPage() {
  const [open, setOpen] = useState(false)
  const { page, limit, setPage, setLimit } = usePaginationParams()
  const debouncedPage = useDebounce(page, 300)
  const debouncedLimit = useDebounce(limit, 300)

  const { data, isLoading } = useQuery<{
    items: Organization[]
    meta: {
      total: number
      page: number
      lastPage: number
      perPage: number
    }
  }>({
    queryKey: ['organizations', debouncedPage, debouncedLimit],
    queryFn: () => api.getOrganizations(debouncedPage, debouncedLimit),
  })

  const organizations = data?.items || []

  async function handleSuccess() {
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
            </DialogHeader>
            <CreateOrganizationForm onSuccess={() => handleSuccess()} />
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
            {organizations?.map((org: Organization) => (
              <Card key={org.id}>
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>{org.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">{org.description}</p>
                    <p className="text-sm text-gray-500">{org.address}</p>
                    <p className="font-medium">
                      Monthly Fee: ${Number(org?.monthlyFee || 0).toFixed(2)}
                    </p>
                    <EditOrganization organization={org} />
                  </div>
                </CardContent>
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
      )
      }

    </div>
  )
}