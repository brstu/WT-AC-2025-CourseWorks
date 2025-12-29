import { ChangeEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS, SPEAKERS_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, ISpeaker } from '@/app/shared/interface'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'

type FormValues = {
    name: string
    bio: string
    alt: string
    telegram: string
    email: string
    phone: string
}

type EditSpeakerBody = {
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
    selectedSpeaker: ISpeaker | null
    onSuccess?: () => void
}

export const useEditSpeakerServices = ({ selectedSpeaker, onSuccess }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>()

    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)

    const [apiError, setApiError] = useState<string>('')

    const editSpeaker = async (data: EditSpeakerBody) => {
        if (!selectedSpeaker) {
            return
        }

        try {
            setApiError('')

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

            if (coverFile) {
                formData.append('image', coverFile)
            }

            formData.append('name', data.name)
            formData.append('bio', data.bio)
            formData.append('alt', data.alt)
            formData.append('contacts', JSON.stringify(contacts))

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/speakers/${selectedSpeaker?._id}`,
                {
                    method: 'PATCH',
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
        await editSpeaker(data)
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

        const input = document.querySelector<HTMLInputElement>('#edit-speaker-file-choose')

        if (input) {
            input.value = ''
        }
    }

    useEffect(() => {
        if (!selectedSpeaker) {
            return
        }

        reset({
            name: selectedSpeaker.name,
            bio: selectedSpeaker.bio,
            alt: selectedSpeaker.photo?.alt ?? '',
            telegram: selectedSpeaker.contacts?.telegram ?? '',
            email: selectedSpeaker.contacts?.email ?? '',
            phone: selectedSpeaker.contacts?.phone ?? '',
        })

        if (selectedSpeaker.photo?.name) {
            // setCoverPreviewUrl(`${PUBLIC_URLS.imagesSpeakers}/${selectedSpeaker.photo.name}`)
        } else {
            setCoverPreviewUrl(null)
        }

        setCoverFile(null)
    }, [selectedSpeaker, reset])

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
