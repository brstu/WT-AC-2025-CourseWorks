'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { COMMON_ERRORS, envConfig } from '@/app/constants/'
import type { IOrderAdmin } from '@/app/module/order-edit/order-edit.types'

interface IOrdersResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    page: number
    limit: number
    total: number
    pages: number
    data: IOrderAdmin[]
}

export const useOrdersTable = () => {
    const router = useRouter()

    const [orders, setOrders] = useState<IOrderAdmin[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrders = useCallback(
        async (pageToLoad: number) => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await fetch(
                    `${envConfig.API_URL}/orders?page=${pageToLoad}&limit=20`,
                    {
                        method: 'GET',
                        credentials: 'include',
                        cache: 'no-store',
                    }
                )

                if (response.status === 401) {
                    router.push('/login')
                    return
                }

                const json: IOrdersResponse = await response.json()

                if (!response.ok || json.status === 'error') {
                    throw new Error(json.message || `Request failed with status ${response.status}`)
                }

                setOrders(json.data || [])
                setPage(json.page)
                setTotalPages(json.pages)
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
                setError(message)
            } finally {
                setIsLoading(false)
            }
        },
        [router]
    )

    useEffect(() => {
        fetchOrders(1)
    }, [fetchOrders])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchOrders(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    return {
        orders,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
