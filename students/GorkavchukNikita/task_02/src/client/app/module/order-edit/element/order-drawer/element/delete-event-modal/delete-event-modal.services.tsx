'use client'

import { useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'

import type { IOrderAdmin, IOrderEventAdmin } from '../../../../order-edit.types'

interface IDeleteEventResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
    event?: IOrderEventAdmin
}

interface IProps {
    orderId: string | null
    selectedEvent: IOrderEventAdmin | null
    onSuccess?: (payload: { order?: IOrderAdmin; event?: IOrderEventAdmin }) => void
}

export const useDeleteEventServices = ({ orderId, selectedEvent, onSuccess }: IProps) => {
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const handleSubmit = async () => {
        try {
            setApiError('')

            if (!orderId) throw new Error('Order is not selected')
            if (!selectedEvent?._id) throw new Error('Event is not selected')

            setLoading(true)

            const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

            const response = await fetch(`${base}/order/${orderId}/event/${selectedEvent._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const json: IDeleteEventResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            onSuccess?.({ order: json.order, event: json.event })
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setApiError(message)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        apiError,
        handleSubmit,
    }
}
