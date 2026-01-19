import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus } from '@/app/shared/interface'
import { EUserRoles, envConfig } from '@/app/constants/'

type FormValues = {
    firstname: string
    lastname?: string
    phone?: string
    role: string
    email: string
    password: string
}

type CreateUserBody = {
    firstname: string
    lastname?: string
    phone?: string
    role: string
    email: string
    password: string
}

interface IProps {
    onSuccess?: () => void
}

export const useCreateUserServices = ({ onSuccess }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>()

    const [role, setRole] = useState<EUserRoles>('user')
    const [apiError, setApiError] = useState<string>('')

    const createUser = async (data: CreateUserBody) => {
        console.log(data)
        try {
            setApiError('')

            const response = await fetch(`${envConfig.API_URL_ADMIN}/users/`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ ...data, role }),
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
        }
    }

    const handleSubmit = async (data: FormValues) => {
        createUser(data)
    }

    const handleSelectRole = (role: EUserRoles) => {
        setRole(role)
    }

    return {
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        role,
        register,
        handleSubmit,
        handleSelectRole,
    }
}
