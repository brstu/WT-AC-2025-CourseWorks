import { useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, ISpeaker } from '@/app/shared/interface'

interface IProps {
    selectedSpeaker: ISpeaker | null
    onSuccess?: () => void
}

export const useDeleteSpeakerServices = ({ selectedSpeaker, onSuccess }: IProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<string>('')

    const deleteSpeaker = async () => {
        if (!selectedSpeaker) {
            return
        }

        try {
            setLoading(true)
            setApiError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/speakers/${selectedSpeaker?._id}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        await deleteSpeaker()
    }

    return {
        apiError,
        loading,
        handleSubmit,
    }
}
