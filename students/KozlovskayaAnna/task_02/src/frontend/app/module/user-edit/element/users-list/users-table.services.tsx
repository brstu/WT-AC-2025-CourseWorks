'use client'

import { useCallback, useEffect, useState } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { IUserAdmin } from '@/app/shared/interface'

interface IUsersResponse {
    status: 'ok'
    code: number
    data: {
        page: number
        limit: number
        total: number
        pages: number
        users: IUserAdmin[]
    }
}

interface IProps {
    refreshToken: number
}

export const useUsersTable = ({ refreshToken }: IProps) => {
    const [users, setUsers] = useState<IUserAdmin[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsers = useCallback(async (pageToLoad: number) => {
        try {
            setIsLoading(true)
            setError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/users?page=${pageToLoad}&limit=20`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: IUsersResponse = await response.json()

            setUsers(json.data.users)
            setPage(json.data.page)
            setTotalPages(json.data.pages)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers(1)
    }, [fetchUsers])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchUsers(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    useEffect(() => {
        fetchUsers(1)
    }, [refreshToken, fetchUsers])

    return {
        users,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
