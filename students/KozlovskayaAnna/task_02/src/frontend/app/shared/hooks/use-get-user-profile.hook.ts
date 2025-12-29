'use client'

import { useState, useCallback } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'

export const useGetUserProfile = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    const getUserProfile = useCallback(async () => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
                method: 'GET',
                credentials: 'include',
            })

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

    return { isLoading, error, getUserProfile }
}
