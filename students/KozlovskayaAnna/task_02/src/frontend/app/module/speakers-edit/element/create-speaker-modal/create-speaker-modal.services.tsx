import { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, SPEAKERS_ERRORS } from '@/app/constants/errors'
import { EResponseStatus } from '@/app/shared/interface'

type FormValues = {
    name: string
    bio: string
    alt: string
    telegram: string
    email: string
    phone: string
}

type CreateSpeakerBody = {
    name: string
    bio: string
    alt: string
    telegram: string
    email: string
    phone: string
}

type ContactKeys = 'telegram' | 'phone' | 'email'

type Contacts = Partial<Record<ContactKeys, string>>

interface IProps {
    onSuccess?: () => void
}

export const useCreateSpeakerServices = ({ onSuccess }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>()

    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

    const [apiError, setApiError] = useState<string>('')

    const createSpeaker = async (data: CreateSpeakerBody) => {
        try {
            setApiError('')

            if (!coverFile) {
                throw new Error(SPEAKERS_ERRORS.PHOTO_REQUIRED)
            }

            const contacts: Contacts = {}

            if (data.telegram) {
                contacts.telegram = data.telegram
            }

            if (data.phone) {
                contacts.phone = data.phone
            }

            if (data.email) {
                contacts.email = data.email
            }

            const formData = new FormData()

            formData.append('name', data.name)
            formData.append('bio', data.bio)
            formData.append('alt', data.alt)
            formData.append('contacts', JSON.stringify(contacts))
            formData.append('image', coverFile)

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/speakers/`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            // window.location.reload()
            onSuccess?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setApiError(message)
            console.error(message)
        }
    }

    const handleSubmit = async (data: FormValues) => {
        await createSpeaker(data)
    }

    const coverFileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setCoverFile(file)

        const url = URL.createObjectURL(file)
        setCoverPreviewUrl(url)
    }

    const handleClearCover = () => {
        setCoverFile(null)
        setCoverPreviewUrl(null)

        const input = document.querySelector<HTMLInputElement>('#create-speaker-file-choose')

        if (input) {
            input.value = ''
        }
    }

    return {
        coverFile,
        coverPreviewUrl,
        validateBeforeSubmit,
        errors,
        apiError,
        isSubmitting,
        register,
        handleSubmit,
        coverFileChangeHandler,
        handleClearCover,
    }
}
