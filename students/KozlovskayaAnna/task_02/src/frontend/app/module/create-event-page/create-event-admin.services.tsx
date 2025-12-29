import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EResponseStatus, IEventSpeaker } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

export const useCreateEventPageAdminServices = () => {
    const router = useRouter()

    const [title, setTitle] = useState<string>('')
    const [contentMd, setContentMd] = useState<string>('')
    const [venue, setVenue] = useState<string>('')
    const [capacity, setCapacity] = useState<string>('')
    const [startsAt, setStartsAt] = useState<string>('')
    const [endsAt, setEndsAt] = useState<string>('')

    const [coverAlt, setCoverAlt] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
    const [speakers, setSpeakers] = useState<IEventSpeaker[]>([])

    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const titleChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setTitle(value)
    }

    const contentMdChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        setContentMd(value)
    }

    const venueChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setVenue(value)
    }

    const capacityChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setCapacity(value)
    }

    const startsAtChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setStartsAt(value)
    }

    const endsAtChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setEndsAt(value)
    }

    const altCoverChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setCoverAlt(value)
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

        const input = document.querySelector<HTMLInputElement>('#event-admin-file-choose')

        if (input) {
            input.value = ''
        }
    }

    const addSpeaker = (speaker: IEventSpeaker) => {
        setSpeakers((prev) => {
            if (prev.some((s) => s._id === speaker._id)) return prev

            const updated = [...prev, speaker]
            return updated
        })
    }

    const removeSpeaker = (speakerId: string) => {
        setSpeakers((prev) => {
            const updated = prev.filter((s) => s._id !== speakerId)
            return updated
        })
    }

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            setError('')

            const formData = new FormData()
            const speakersIds: string[] = []

            speakers.forEach((item) => {
                speakersIds.push(item._id)
            })

            if (!coverFile) {
                throw new Error('Cover Included')
            }

            formData.append('title', title.trim())
            formData.append('content', contentMd)
            formData.append('venue', venue)
            formData.append('capacity', String(capacity))
            formData.append('speakers', JSON.stringify(speakersIds))
            formData.append('startsAt', startsAt)
            formData.append('endsAt', endsAt)
            formData.append('cover', coverFile)
            formData.append('alt', coverAlt)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/events/`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            })
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            router.replace(`/events/${json.data.event._id}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            console.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            if (coverPreviewUrl) {
                URL.revokeObjectURL(coverPreviewUrl)
            }
        }
    }, [coverPreviewUrl])

    return {
        title,
        contentMd,
        venue,
        capacity,
        startsAt,
        endsAt,
        coverAlt,
        coverFile,
        coverPreviewUrl,
        speakers,
        error,
        isLoading,
        titleChangeHandler,
        contentMdChangeHandler,
        venueChangeHandler,
        capacityChangeHandler,
        startsAtChangeHandler,
        endsAtChangeHandler,
        altCoverChangeHandler,
        coverFileChangeHandler,
        handleClearCover,
        addSpeaker,
        removeSpeaker,
        handleSubmit,
    }
}
