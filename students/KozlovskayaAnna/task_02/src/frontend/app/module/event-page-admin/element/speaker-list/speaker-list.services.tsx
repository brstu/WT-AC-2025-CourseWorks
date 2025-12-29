'use client'

import { useState, useEffect } from 'react'
import type { ISpeaker } from '@/app/shared/interface/speaker.interface'

const LIMIT = 6

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

export const useSpeakersPagination = () => {
    const [speakers, setSpeakers] = useState<ISpeaker[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const fetchSpeakers = async (page: number) => {
        try {
            setIsLoading(true)
            setError('')

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/speakers?page=${page}&limit=${LIMIT}`,
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
            setCurrentPage(json.data.page)
            setTotalPages(json.data.pages)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unexpected error'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSpeakers(1)
    }, [])

    const goToPage = (page: number) => {
        if (page === currentPage || page < 1 || page > totalPages) return
        fetchSpeakers(page)
    }

    const goNext = () => {
        if (currentPage < totalPages) {
            fetchSpeakers(currentPage + 1)
        }
    }

    const goPrev = () => {
        if (currentPage > 1) {
            fetchSpeakers(currentPage - 1)
        }
    }

    return {
        speakers,
        currentPage,
        totalPages,
        isLoading,
        error,
        goToPage,
        goNext,
        goPrev,
    }
}
