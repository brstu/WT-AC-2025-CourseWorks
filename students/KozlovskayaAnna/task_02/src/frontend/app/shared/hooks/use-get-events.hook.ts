import { useCallback, useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'

export const useGetEventsHook = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const getEvents = useCallback(async (page: number = 1, limit: number = 6) => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/?page=${page}&limit=${limit}`
            )

            const data = await response.json()
            return data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            throw new Error(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { getEvents, isLoading, error }
}
