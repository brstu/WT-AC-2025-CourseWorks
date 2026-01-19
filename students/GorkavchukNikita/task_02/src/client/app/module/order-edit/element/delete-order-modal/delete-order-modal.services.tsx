'use client'

import { useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'

import type { IOrderAdmin } from '../../order-edit.types'

interface IDeleteOrderResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
}

interface IProps {
    selectedOrder: IOrderAdmin | null
    onSuccess?: () => void
}

export const useDeleteOrderServices = ({ selectedOrder, onSuccess }: IProps) => {
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const handleSubmit = async () => {
        try {
            setApiError('')

            if (!selectedOrder?._id) {
                throw new Error('Order is not selected')
            }

            setLoading(true)

            const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

            const response = await fetch(`${base}/order/${selectedOrder._id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            const json: IDeleteOrderResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            onSuccess?.()
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
