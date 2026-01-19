import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, ICountry } from '@/app/shared/interface'

type FormValues = {
    name: string
    countryCode: string
}

type PatchCountryBody = {
    name: string
    countryCode: string
}

interface IProps {
    selectedCountry: ICountry | null
    onSuccess?: () => void
}

export const useEditCountryServices = ({ onSuccess, selectedCountry }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [apiError, setApiError] = useState<string>('')

    const patchCountry = async (data: PatchCountryBody) => {
        if (!selectedCountry) {
            return
        }

        try {
            setApiError('')

            const payload = {
                ...data,
                countryCode: data.countryCode.trim().toUpperCase(),
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/country/${selectedCountry._id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'PATCH',
                    credentials: 'include',
                    body: JSON.stringify(payload),
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
        }
    }

    const handleSubmit = async (data: FormValues) => {
        patchCountry(data)
    }

    useEffect(() => {
        if (!selectedCountry) {
            return
        }

        reset({
            name: selectedCountry.name ?? '',
            countryCode: selectedCountry.countryCode ?? '',
        })
    }, [selectedCountry, reset])

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
    }
}
