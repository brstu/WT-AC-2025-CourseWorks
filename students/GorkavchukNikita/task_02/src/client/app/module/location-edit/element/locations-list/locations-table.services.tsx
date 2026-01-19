'use client'

import { useCallback, useEffect, useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { ILocation } from '@/app/shared/interface'

interface ILocationsResponse {
    status: 'ok'
    code: number
    page: number
    limit: number
    total: number
    pages: number
    data: ILocation[]
}

interface IProps {
    refreshToken: number
}

export const useLocationsTable = ({ refreshToken }: IProps) => {
    const [locations, setLocations] = useState<ILocation[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLocations = useCallback(async (pageToLoad: number) => {
        try {
            setIsLoading(true)
            setError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/location?page=${pageToLoad}&limit=20`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: ILocationsResponse = await response.json()

            setLocations(json.data)
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
        fetchLocations(1)
    }, [fetchLocations, refreshToken])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchLocations(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    return {
        locations,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
