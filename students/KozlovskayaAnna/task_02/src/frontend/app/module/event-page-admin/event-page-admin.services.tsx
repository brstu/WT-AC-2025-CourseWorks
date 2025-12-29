import { ChangeEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EResponseStatus, IEventAdmin, IEventSpeaker } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { formatDateForInput } from '@/app/shared/utils'

interface IProps {
    event: IEventAdmin | null
}

type EventUpdateDto = Partial<{
    title: string
    content: string
    venue: string
    capacity: string
    startsAt: string
    endsAt: string
    cover: string
    alt: string
    speakers: IEventSpeaker[]
}>

export const useEventPageAdminServices = ({ event }: IProps) => {
    const initialData = { ...event }

    const router = useRouter()

    const [title, setTitle] = useState<string>(event?.title || '')
    const [contentMd, setContentMd] = useState<string>(event?.content.md || '')
    const [venue, setVenue] = useState<string>(event?.venue || '')
    const [capacity, setCapacity] = useState<string>(event?.capacity.toString() || '')
    const [startsAt, setStartsAt] = useState<string>(
        event?.startsAt ? formatDateForInput(event?.startsAt) : ''
    )
    const [endsAt, setEndsAt] = useState<string>(
        event?.endsAt ? formatDateForInput(event.endsAt) : ''
    )

    const [coverAlt, setCoverAlt] = useState(event?.cover.alt)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
    const [speakers, setSpeakers] = useState<IEventSpeaker[]>(event?.speakers || [])

    const [dataEdited, setDataEdited] = useState<EventUpdateDto>({})

    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false)

    const initialUpdateView: EventUpdateDto = {
        title: initialData.title || '',
        content: initialData?.content?.md || '',
        venue: initialData.venue || '',
        capacity: initialData?.capacity?.toString() || '',
        startsAt: initialData.startsAt || '',
        endsAt: initialData.endsAt || '',
        cover: initialData?.cover?.name || '',
        alt: initialData?.cover?.alt || '',
        speakers: initialData.speakers || [],
    }

    const setFieldEdited = <K extends keyof EventUpdateDto>(key: K, value: EventUpdateDto[K]) => {
        setDataEdited((prev) => {
            const next: EventUpdateDto = { ...prev, [key]: value }

            const isSameAsInitial = value === initialUpdateView[key]

            if (isSameAsInitial) {
                const { [key]: _, ...rest } = next
                return rest
            }

            return next
        })
    }

    const titleChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setTitle(value)
        setFieldEdited('title', value)
    }

    const contentMdChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        setContentMd(value)
        setFieldEdited('content', value)
    }

    const venueChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setVenue(value)
        setFieldEdited('venue', value)
    }

    const capacityChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setCapacity(value)
        setFieldEdited('capacity', value)
    }

    const startsAtChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setStartsAt(value)
        setFieldEdited('startsAt', value)
    }

    const endsAtChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setEndsAt(value)
        setFieldEdited('endsAt', value)
    }

    const altCoverChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setCoverAlt(value)
        setFieldEdited('alt', value)
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
            setFieldEdited('speakers', updated)
            return updated
        })
    }

    const removeSpeaker = (speakerId: string) => {
        setSpeakers((prev) => {
            const updated = prev.filter((s) => s._id !== speakerId)
            setFieldEdited('speakers', updated)
            return updated
        })
    }

    const submitChanges = async () => {
        if (!event) return
        try {
            setIsLoading(true)
            setError('')

            const formData = new FormData()

            if (coverFile) {
                formData.append('cover', coverFile)
            }

            Object.entries(dataEdited).forEach(([key, value]) => {
                if (!key || !value) {
                    return
                }

                if (key === 'speakers') {
                    const idsArray: string[] = []

                    if (speakers.length === 0) {
                        throw new Error('Speakers must be greater than or equal to 1')
                    }

                    speakers.forEach((item) => {
                        idsArray.push(item._id)
                    })

                    formData.append('speakers', JSON.stringify(idsArray))
                    return
                }

                formData.append(key, String(value))
            })

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/events/${event._id}`,
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

            router.replace(`/events/${event?._id}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            console.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenModal = () => {
        setConfirmModalOpen(true)
    }

    const handleCloseModal = () => {
        setConfirmModalOpen(false)
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
        confirmModalOpen,
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
        submitChanges,
        handleOpenModal,
        handleCloseModal,
    }
}
