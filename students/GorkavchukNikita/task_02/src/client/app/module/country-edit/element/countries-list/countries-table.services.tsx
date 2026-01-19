'use client'

import { useCallback, useEffect, useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { ICountry } from '@/app/shared/interface'

interface ICountriesResponse {
    status: 'ok'
    code: number
    page: number
    limit: number
    total: number
    pages: number
    data: ICountry[]
}

interface IProps {
    refreshToken: number
}

export const useCountriesTable = ({ refreshToken }: IProps) => {
    const [countries, setCountries] = useState<ICountry[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCountries = useCallback(async (pageToLoad: number) => {
        try {
            setIsLoading(true)
            setError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/country?page=${pageToLoad}&limit=20`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: ICountriesResponse = await response.json()

            setCountries(json.data)
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
        fetchCountries(1)
    }, [fetchCountries, refreshToken])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchCountries(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    return {
        countries,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
