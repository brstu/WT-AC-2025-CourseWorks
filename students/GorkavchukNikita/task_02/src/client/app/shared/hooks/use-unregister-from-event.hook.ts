import { useCallback, useState } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus } from '../interface'

export const useUnregisterFromEventHook = (eventId: string) => {
    const [unregisterPending, setUnregisterPending] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const unregisterEvent = useCallback(async () => {
        setUnregisterPending(true)
        setError('')

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}/atendees`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )

            const data = await response.json()

            if (data.status === EResponseStatus.error) {
                throw new Error(data.message)
            }

            return data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            throw new Error(message)
        } finally {
            setUnregisterPending(false)
        }
    }, [eventId])

    return {
        unregisterEvent,
        unregisterPending,
        error,
    }
}
