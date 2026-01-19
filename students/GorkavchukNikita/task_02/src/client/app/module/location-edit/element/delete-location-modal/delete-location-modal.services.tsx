import { useState } from 'react'

import { COMMON_ERRORS, envConfig } from '@/app/constants'
import { EResponseStatus, ILocation } from '@/app/shared/interface'

interface IProps {
    selectedLocation: ILocation | null
    onSuccess?: () => void
}

export const useDeleteLocationServices = ({ selectedLocation, onSuccess }: IProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [apiError, setApiError] = useState<string>('')

    const deleteLocation = async () => {
        if (!selectedLocation) {
            return
        }

        try {
            setLoading(true)
            setApiError('')

            const response = await fetch(`${envConfig.API_URL_ADMIN}/location/${selectedLocation._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

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
        deleteLocation()
    }

    return {
        apiError,
        loading,
        handleSubmit,
    }
}
