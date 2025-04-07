import { useSearchParams } from 'react-router-dom'

export function usePaginationParams(defaultPage = 1, defaultLimit = 10) {
    const [params, setParams] = useSearchParams()

    const page = Number(params.get('page')) || defaultPage
    const limit = Number(params.get('limit')) || defaultLimit

    const setPage = (newPage: number) => {
        const updated = new URLSearchParams(params)
        updated.set('page', String(newPage))
        setParams(updated)
    }

    const setLimit = (newLimit: number) => {
        const updated = new URLSearchParams(params)
        updated.set('limit', String(newLimit))
        updated.set('page', '1')
        setParams(updated)
    }

    return {
        page,
        limit,
        setPage,
        setLimit,
    }
}
