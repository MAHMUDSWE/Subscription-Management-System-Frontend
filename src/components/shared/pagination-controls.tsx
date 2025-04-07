import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

interface PaginationControlsProps {
    page: number
    totalPages: number
    onPageChange: (newPage: number) => void
    className?: string
    isLoading?: boolean
    showPageNumbers?: boolean
    limit?: number
    onLimitChange?: (newLimit: number) => void
    pageSizeOptions?: number[]
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    page,
    totalPages,
    onPageChange,
    className = '',
    isLoading = false,
    showPageNumbers = true,
    limit,
    onLimitChange,
    pageSizeOptions = [10, 20, 50, 100],
}) => {
    if (totalPages <= 1 && !limit) return null

    const handlePrevious = () => {
        if (!isLoading && page > 1) onPageChange(page - 1)
    }

    const handleNext = () => {
        if (!isLoading && page < totalPages) onPageChange(page + 1)
    }

    const pageNumbers = useMemo(() => {
        if (!showPageNumbers || totalPages <= 1) return []

        const pages: number[] = []
        const range = 2

        for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
            pages.push(i)
        }

        if (pages[0] > 1) pages.unshift(1)
        if (pages[0] !== 1 + 1) pages.splice(1, 0, -1) // -1 means "..."

        if (pages[pages.length - 1] < totalPages) {
            if (pages[pages.length - 1] !== totalPages - 1) pages.push(-1)
            pages.push(totalPages)
        }

        return pages
    }, [page, totalPages, showPageNumbers])

    return (
        <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-2', className)}>
            <div className="flex items-center gap-2">
                {typeof limit === 'number' && onLimitChange && (
                    <Select
                        value={String(limit)}
                        onValueChange={(value) => onLimitChange(Number(value))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={handlePrevious}
                            className={cn(page === 1 || isLoading ? 'pointer-events-none opacity-50' : '')}
                        />
                    </PaginationItem>

                    {pageNumbers.map((p, idx) =>
                        p === -1 ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                                <span className="px-2 text-muted-foreground">...</span>
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={p}>
                                <button
                                    onClick={() => onPageChange(p)}
                                    disabled={p === page || isLoading}
                                    className={cn(
                                        'px-3 py-1 text-sm rounded-md',
                                        p === page ? 'bg-primary text-white' : 'hover:bg-muted',
                                        isLoading && 'opacity-50 pointer-events-none'
                                    )}
                                >
                                    {p}
                                </button>
                            </PaginationItem>
                        )
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={handleNext}
                            className={cn(page === totalPages || isLoading ? 'pointer-events-none opacity-50' : '')}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
