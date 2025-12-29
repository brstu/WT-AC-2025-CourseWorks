import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EResponseStatus, IEvent } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

interface IProps {
    event: IEvent | null
}

export const useInviteModalServices = ({ event }: IProps) => {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<string>('')

    const deleteEvent = async () => {
        if (!event) return
        try {
            setIsLoading(true)
            setApiError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/events/${event._id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            router.replace(`/`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        apiError,
        deleteEvent,
    }
}
