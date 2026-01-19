import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { envConfig } from '@/app/constants'
import { EResponseStatus } from '@/app/shared/interface'

type FormValues = {
    name: string
    countryCode: string
}

type CreateCountryBody = {
    name: string
    countryCode: string
}

interface IProps {
    onSuccess?: () => void
}

export const useCreateCountryServices = ({ onSuccess }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [apiError, setApiError] = useState<string>('')

    const createCountry = async (data: CreateCountryBody) => {
        try {
            setApiError('')

            const payload = {
                ...data,
                countryCode: data.countryCode.trim().toUpperCase(),
            }

            const response = await fetch(`${envConfig.API_URL_ADMIN}/country/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            reset({ name: '', countryCode: '' })
            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        createCountry(data)
    }

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
    }
}
