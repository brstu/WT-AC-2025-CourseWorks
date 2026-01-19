import { useCallback, useState } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus } from '../interface'

export const useJoinToEventHook = (eventId: string) => {
    const [joinPending, setJoinPending] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const joinEvent = useCallback(async () => {
        setJoinPending(true)
        setError('')

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}/atendees`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            )

            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            return json.data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            throw new Error(message)
        } finally {
            setJoinPending(false)
        }
    }, [eventId])

    return {
        joinEvent,
        joinPending,
        error,
    }
}
