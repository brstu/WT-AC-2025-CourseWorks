'use client'

import { useCallback, useEffect, useState } from 'react'
import { ISpeaker } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

type SpeakerContacts = {
    telegram: string
    phone: string
    email: string
}

type SpeakerPhoto = {
    name: string
    alt: string
}

export type Speaker = {
    _id: string
    name: string
    bio: string
    contacts: SpeakerContacts
    photo: SpeakerPhoto
    createdAt: string
    updatedAt: string
}

interface ISpeakersResponse {
    status: 'ok'
    code: number
    data: {
        page: number
        limit: number
        total: number
        pages: number
        speakers: ISpeaker[]
    }
}

interface IProps {
    refreshToken: number
}

export const useSpeakersTable = ({ refreshToken }: IProps) => {
    const [speakers, setSpeakers] = useState<Speaker[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSpeakers = useCallback(async (pageToLoad: number) => {
        try {
            setIsLoading(true)
            setError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/speakers?page=${pageToLoad}&limit=20`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`)
            }

            const json: ISpeakersResponse = await response.json()

            setSpeakers(json.data.speakers)
            setPage(json.data.page)
            setTotalPages(json.data.pages)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSpeakers(1)
    }, [fetchSpeakers])

    const goToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
        fetchSpeakers(nextPage)
    }

    const goNext = () => goToPage(page + 1)
    const goPrev = () => goToPage(page - 1)

    useEffect(() => {
        fetchSpeakers(1)
    }, [refreshToken, fetchSpeakers])

    return {
        speakers,
        page,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
