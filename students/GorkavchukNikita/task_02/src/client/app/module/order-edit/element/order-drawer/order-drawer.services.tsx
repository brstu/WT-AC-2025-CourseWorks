'use client'

import { useCallback, useEffect, useState } from 'react'

import { COMMON_ERRORS } from '@/app/constants/errors'

import type { IOrderAdmin, IOrderEventAdmin, TOrderStatus } from '../../order-edit.types'

interface IGetOrderResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
    events?: IOrderEventAdmin[]
}

interface IPatchOrderResponse {
    status: 'ok' | 'error'
    code: number
    message?: string
    order?: IOrderAdmin
}

interface IProps {
    open: boolean
    orderId: string | null
    onOrderUpdated?: () => void
}

export const useOrderDrawerServices = ({ open, orderId, onOrderUpdated }: IProps) => {
    const [order, setOrder] = useState<IOrderAdmin | null>(null)
    const [events, setEvents] = useState<IOrderEventAdmin[]>([])

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [orderStatus, setOrderStatus] = useState<string>('')
    const [statusSaving, setStatusSaving] = useState(false)
    const [statusError, setStatusError] = useState<string>('')

    const loadOrder = useCallback(async () => {
        try {
            setError(null)
            setIsLoading(true)

            if (!orderId) {
                setOrder(null)
                setEvents([])
                return
            }

            const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

            const response = await fetch(`${base}/order/${orderId}`, {
                method: 'GET',
                credentials: 'include',
            })

            const json: IGetOrderResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            setOrder(json.order || null)
            setEvents(json.events || [])
            setOrderStatus(json.order ? String(json.order.status) : '')
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [orderId])

    useEffect(() => {
        if (!open) return
        loadOrder()
    }, [open, loadOrder])

    const saveOrderStatus = async () => {
        try {
            setStatusError('')

            if (!orderId) throw new Error('Order is not selected')

            const base = process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL
            if (!base) throw new Error('NEXT_PUBLIC_API_ADMIN_BASE_URL is not defined')

            setStatusSaving(true)

            const response = await fetch(`${base}/order/${orderId}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: Number(orderStatus) as TOrderStatus }),
            })

            const json: IPatchOrderResponse = await response.json()

            if (!response.ok || json.status === 'error') {
                throw new Error(json.message || `Request failed with status ${response.status}`)
            }

            if (json.order) {
                setOrder(json.order)
            }

            onOrderUpdated?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
            setStatusError(message)
        } finally {
            setStatusSaving(false)
        }
    }

    return {
        order,
        events,
        setOrder,
        setEvents,
        isLoading,
        error,
        orderStatus,
        setOrderStatus,
        statusSaving,
        statusError,
        loadOrder,
        saveOrderStatus,
    }
}
