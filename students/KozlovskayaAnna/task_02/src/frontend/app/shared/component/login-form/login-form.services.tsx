import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { EResponseStatus } from '../../interface'

import { useUserStore } from '../../store'

import { COMMON_ERRORS } from '@/app/constants/errors'

type FormValues = {
    email: string
    password: string
}

type LoginBody = {
    email: string
    password: string
}

export const useLoginFormServices = () => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>()

    const router = useRouter()

    const setUser = useUserStore((state) => state.setUser)

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [apiError, setApiError] = useState<string>('')

    const handleLogin = async (data: LoginBody) => {
        if (isSubmitting) {
            return
        }

        try {
            setApiError('')

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
                credentials: 'include',
            })
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                setApiError(json.message)
                throw new Error(json.message)
            }

            setUser(json.data.user)

            router.replace('/')

            return json.data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        await handleLogin(data)
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    return {
        register,
        validateBeforeSubmit,
        handleSubmit,
        errors,
        apiError,
        isSubmitting,
        showPassword,
        handleTogglePasswordVisibility,
    }
}
