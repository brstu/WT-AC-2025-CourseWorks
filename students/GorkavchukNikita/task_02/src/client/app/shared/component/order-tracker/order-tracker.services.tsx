'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { COMMON_ERRORS } from '@/app/constants/errors'
import type { IOrderAdmin, IOrderEventAdmin } from '@/app/module/order-edit/order-edit.types'

interface ITrackingResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
    events?: IOrderEventAdmin[]
}

const QUERY_KEY = 'code'

export const useOrderTrackerServices = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const codeFromUrl = useMemo(() => (searchParams.get(QUERY_KEY) || '').trim(), [searchParams])

    const [trackingCode, setTrackingCode] = useState('')
    const [order, setOrder] = useState<IOrderAdmin | null>(null)
    const [events, setEvents] = useState<IOrderEventAdmin[]>([])

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const lastAppliedCodeRef = useRef<string>('')

    const buildUrlWithCode = useCallback(
        (code: string) => {
            const params = new URLSearchParams(searchParams.toString())

            if (code) params.set(QUERY_KEY, code)
            else params.delete(QUERY_KEY)

            const qs = params.toString()
            return qs ? `${pathname}?${qs}` : pathname
        },
        [pathname, searchParams]
    )

    const searchByCode = useCallback(async (code: string) => {
        const trimmed = code.trim()

        try {
            setError('')

            if (!trimmed) {
                setOrder(null)
                setEvents([])
                throw new Error('Tracking code is required')
            }

            const base = process.env.NEXT_PUBLIC_API_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined')

            setIsLoading(true)

            const response = await fetch(`${base}/tracking/${encodeURIComponent(trimmed)}`, {
                method: 'GET',
                cache: 'no-store',
            })

            const json: ITrackingResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            setOrder(json.order || null)
            setEvents(json.events || [])
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!codeFromUrl) return
        if (lastAppliedCodeRef.current === codeFromUrl) return

        lastAppliedCodeRef.current = codeFromUrl
        setTrackingCode(codeFromUrl)
        searchByCode(codeFromUrl)
    }, [codeFromUrl, searchByCode])

    const submit = useCallback(
        async (code?: string) => {
            const trimmed = (code ?? trackingCode).trim()

            lastAppliedCodeRef.current = trimmed

            router.push(buildUrlWithCode(trimmed))

            await searchByCode(trimmed)
        },
        [buildUrlWithCode, router, searchByCode, trackingCode]
    )

    const clear = useCallback(() => {
        lastAppliedCodeRef.current = ''
        setTrackingCode('')
        setOrder(null)
        setEvents([])
        setError('')
        router.push(buildUrlWithCode(''))
    }, [buildUrlWithCode, router])

    return {
        trackingCode,
        setTrackingCode,

        order,
        events,

        isLoading,
        error,

        // actions
        submit,
        clear,
    }
}
