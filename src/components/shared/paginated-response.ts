export type PaginatedResponse<T> = {
    items: T[]
    meta: {
        total: number
        page: number
        lastPage: number
        perPage: number
    }
}