'use client'

import { useCallback, useEffect, useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'

import type { IOrderAdmin } from '../../order-edit.types'

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

interface IProps {
    refreshToken: number
}

export const useOrdersTable = ({ refreshToken }: IProps) => {
    const [orders, setOrders] = useState<IOrderAdmin[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchOrders = useCallback(async (pageToLoad: number) => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/order?page=${pageToLoad}&limit=20`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            const json: IOrdersResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            setOrders(json.data)
            setPage(json.page)
            setTotalPages(json.pages)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders(1)
    }, [fetchOrders, refreshToken])

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
