import { useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, ICountry } from '@/app/shared/interface'

interface IProps {
    selectedCountry: ICountry | null
    onSuccess?: () => void
}

export const useDeleteCountryServices = ({ selectedCountry, onSuccess }: IProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<string>('')

    const deleteCountry = async () => {
        if (!selectedCountry) {
            return
        }

        try {
            setLoading(true)
            setApiError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/country/${selectedCountry._id}`,
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
        deleteCountry()
    }

    return {
        apiError,
        loading,
        handleSubmit,
    }
}
