import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, IUserAdmin } from '@/app/shared/interface'

type FormValues = {
    password: string
}

type ChangePasswordBody = {
    password: string
}

interface IProps {
    selectedUser: IUserAdmin | null
    onSuccess?: () => void
}

export const useResetPasswordServices = ({ onSuccess, selectedUser }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [apiError, setApiError] = useState<string>('')

    const resetPassword = async (data: ChangePasswordBody) => {
        try {
            setApiError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/users/${selectedUser?._id}/reset-password`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(data),
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
        await resetPassword(data)
    }

    useEffect(() => {
        if (!selectedUser) {
            return
        }

        reset()
    }, [selectedUser, reset])

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
    }
}
