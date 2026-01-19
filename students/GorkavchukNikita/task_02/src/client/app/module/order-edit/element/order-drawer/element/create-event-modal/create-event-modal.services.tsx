'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { COMMON_ERRORS } from '@/app/constants/errors'

import type { ILocationLite, IOrderAdmin, IOrderEventAdmin } from '../../../../order-edit.types'

type FormValues = {
    location: string
    status: string
    description: string
}

type ILocationOption = ILocationLite & { _id: string }

interface IResponsePaged<T> {
    status?: 'ok' | 'error'
    code?: number
    message?: string
    page?: number
    limit?: number
    total?: number
    pages?: number
    data?: unknown
}

interface ICreateEventResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
    event?: IOrderEventAdmin
}

interface IProps {
    open: boolean
    orderId: string | null
    onSuccess?: (payload: { order?: IOrderAdmin; event?: IOrderEventAdmin }) => void
}

const readJsonSafe = async (response: Response, requestUrl: string) => {
    const text = await response.text()
    try {
        return text ? JSON.parse(text) : {}
    } catch {
        const preview = (text || '').slice(0, 200)
        throw new Error(
            `Non-JSON response from ${requestUrl} (HTTP ${response.status}).${preview ? ` Preview: ${preview}` : ''}`
        )
    }
}

const extractArray = <T,>(json: any): T[] | null => {
    if (Array.isArray(json)) return json as T[]

    const candidates: any[] = [json?.data, json?.items, json?.results, json?.users, json?.locations]

    for (const c of candidates) {
        if (Array.isArray(c)) return c as T[]

        if (c && typeof c === 'object') {
            for (const key of ['data', 'items', 'results', 'users', 'locations']) {
                const maybe = (c as any)[key]
                if (Array.isArray(maybe)) return maybe as T[]
            }
        }
    }

    return null
}

const fetchAllPaged = async <T,>(url: string, opts: RequestInit, limit = 100, maxPages = 50): Promise<T[]> => {
    const items: T[] = []

    for (let page = 1; page <= maxPages; page++) {
        const sep = url.includes('?') ? '&' : '?'
        const requestUrl = `${url}${sep}page=${page}&limit=${limit}`

        const response = await fetch(requestUrl, opts)
        const json: IResponsePaged<T> = await readJsonSafe(response, requestUrl)

        if (!response.ok || json?.status === 'error') {
            throw new Error(json?.message || `Request failed (${response.status}) for ${requestUrl}`)
        }

        const arr = extractArray<T>(json)
        if (!arr) {
            const got = json && typeof (json as any).data !== 'undefined' ? typeof (json as any).data : 'missing'
            throw new Error(`Invalid response from ${requestUrl}: expected array list (got data: ${got})`)
        }

        items.push(...arr)

        const pages = typeof json.pages === 'number' ? json.pages : undefined
        if (!pages || page >= pages) break
    }

    return items
}

export const useCreateEventServices = ({ open, orderId, onSuccess }: IProps) => {
    const {
        register,
        handleSubmit: validateBeforeSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        defaultValues: {
            location: '',
            status: '',
            description: '',
        },
    })

    const [apiError, setApiError] = useState('')

    const [locations, setLocations] = useState<ILocationOption[]>([])
    const [lookupsLoading, setLookupsLoading] = useState(false)
    const [lookupsError, setLookupsError] = useState('')
    const [lookupsLoaded, setLookupsLoaded] = useState(false)

    useEffect(() => {
        if (!open || lookupsLoaded) return

        const load = async () => {
            try {
                setLookupsLoading(true)
                setLookupsError('')

                const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
                if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

                const locationsAll = await fetchAllPaged<ILocationOption>(
                    `${base}/location`,
                    { method: 'GET', credentials: 'include' },
                    100,
                    50
                )

                setLocations(locationsAll)
                setLookupsLoaded(true)
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
                setLookupsError(message)
            } finally {
                setLookupsLoading(false)
            }
        }

        load()
    }, [open, lookupsLoaded])

    const locationOptions = useMemo(() => {
        return locations
            .slice()
            .sort((a, b) => (a.label || '').localeCompare(b.label || ''))
            .map((l) => {
                const city = l.cityId?.name
                const country = l.cityId?.countryId?.name
                const place = [city, country].filter(Boolean).join(', ')
                const base = `${l.label} (${l.locationCode})`
                return { value: l._id, label: place ? `${base} — ${place}` : base }
            })
    }, [locations])

    const handleSubmit = async (data: FormValues) => {
        try {
            setApiError('')

            if (!orderId) throw new Error('Order is not selected')

            const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

            const response = await fetch(`${base}/order/${orderId}/event`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: data.location,
                    status: Number(data.status),
                    description: data.description,
                }),
            })

            const json: ICreateEventResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            reset()
            onSuccess?.({ order: json.order, event: json.event })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setApiError(message)
        }
    }

    return {
        register,
        validateBeforeSubmit,
        errors,
        isSubmitting,
        apiError,
        locationOptions,
        lookupsLoading,
        lookupsError,
        handleSubmit,
    }
}
