'use client'

import { useState, useCallback } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { IRes, IEventAdmin } from '@/app/shared/interface'

export const useGetAdminEvent = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const getAdminEvent = useCallback(async (id: string): Promise<IEventAdmin | null> => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/events/${id}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            const json: IRes<{ event: IEventAdmin }> = await response.json()

            if (!response.ok || !json.data?.event) {
                return null
            }

            return json.data.event
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { isLoading, error, getAdminEvent }
}
