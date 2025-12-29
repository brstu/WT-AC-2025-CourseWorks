import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus } from '@/app/shared/interface'
import { useEventStoreContext } from '@/app/shared/providers'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormValues = {
    email: string
}

type InviteBody = {
    email: string
}

export const useInviteModalServices = () => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<FormValues>()
    const emailValue = watch('email')

    const event = useEventStoreContext((state) => state.event)

    const [apiError, setApiError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    const clearModal = () => {
        setSuccessMessage('')
        setApiError('')
    }

    const handleInvite = async (data: InviteBody) => {
        if (isSubmitting || !event) {
            return
        }

        try {
            setApiError('')
            setSuccessMessage('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${event?._id}/invite`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        user_email: data.email,
                    }),
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                setApiError(json.message)
                throw new Error(json.message)
            }

            const invitation = json.data.invitation

            setSuccessMessage(`${invitation.user_invited.name} was successfully invited!`)

            return json.data
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        await handleInvite(data)
    }

    useEffect(() => {
        setApiError('')
    }, [emailValue])

    return {
        register,
        validateBeforeSubmit,
        errors,
        isSubmitting,
        apiError,
        handleSubmit,
        successMessage,
        clearModal,
    }
}
