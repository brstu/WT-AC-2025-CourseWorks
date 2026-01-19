'use client'

import React, { useMemo, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'

import { Button } from '@/app/shared/component/button'
import { ErrorComponent } from '@/app/shared/component/error'

import { ORDER_STATUS_OPTIONS, ORDER_STATUS_LABELS, EVENT_STATUS_LABELS } from '../../order-edit.constants'
import { formatDateTime, formatLocation } from '../../order-edit.utils'
import type { IOrderEventAdmin } from '../../order-edit.types'

import { useOrderDrawerServices } from './order-drawer.services'
import { CreateEventModal } from './element/create-event-modal'
import { DeleteEventModal } from './element/delete-event-modal'

interface IProps {
    open: boolean
    orderId: string | null
    onClose: () => void
    onOrderUpdated?: () => void
}

export const OrderDrawer = ({ open, orderId, onClose, onOrderUpdated }: IProps) => {
    const thisService = useOrderDrawerServices({ open, orderId, onOrderUpdated })

    const [openCreateEvent, setOpenCreateEvent] = useState(false)
    const [openDeleteEvent, setOpenDeleteEvent] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<IOrderEventAdmin | null>(null)

    const eventsSorted = useMemo(() => {
        return thisService.events
            .slice()
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }, [thisService.events])

    const handleClose = () => {
        onClose?.()
    }

    const openDeleteEventModal = (event: IOrderEventAdmin) => {
        setSelectedEvent(event)
        setOpenDeleteEvent(true)
    }

    const closeDeleteEventModal = () => {
        setSelectedEvent(null)
        setOpenDeleteEvent(false)
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogBackdrop transition className="modal-backdrop" />

            <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
                <DialogPanel
                    transition
                    className="w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-none sm:rounded-l-2xl h-[92vh] sm:h-full overflow-y-auto p-6 data-[closed]:opacity-0 data-[closed]:translate-y-6 sm:data-[closed]:translate-x-6 transition"
                >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                            <DialogTitle className="text-lg font-semibold">
                                Order {thisService.order?.orderCode || ''}
                            </DialogTitle>
                            <p className="text-sm text-gray-600 break-words">
                                {thisService.order?.name || ''}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="soft"
                            color="danger"
                            onClick={handleClose}
                            startIcon={X}
                            className="shrink-0"
                        >
                            Close
                        </Button>
                    </div>

                    {thisService.isLoading && (
                        <div className="py-6 text-center text-gray-500">Loading order...</div>
                    )}

                    {thisService.error && (
                        <div className="py-2">
                            <ErrorComponent>{thisService.error}</ErrorComponent>
                        </div>
                    )}

                    {thisService.order && (
                        <div className="space-y-6">
                            <section className="rounded-xl border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    Order details
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500">Pickup</div>
                                        <div className="text-sm text-gray-900">
                                            {formatLocation(thisService.order.pickupLocation)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Current</div>
                                        <div className="text-sm text-gray-900">
                                            {formatLocation(thisService.order.currentLocation)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Created</div>
                                        <div className="text-sm text-gray-900">
                                            {formatDateTime(thisService.order.createdAt)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Updated</div>
                                        <div className="text-sm text-gray-900">
                                            {formatDateTime(thisService.order.updatedAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                                        <label className="w-full sm:max-w-xs">
                                            <span className="block text-xs text-gray-500 mb-1">
                                                Order status (OS)
                                            </span>
                                            <select
                                                className="form-field-input form-field-input-no-mb"
                                                value={thisService.orderStatus}
                                                onChange={(e) => thisService.setOrderStatus(e.target.value)}
                                            >
                                                {ORDER_STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label} ({opt.value})
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <Button
                                            type="button"
                                            color="black"
                                            isSubmiting={thisService.statusSaving}
                                            onClick={() => thisService.saveOrderStatus()}
                                        >
                                            Save status
                                        </Button>
                                    </div>

                                    <div className="mt-2 text-xs text-gray-500">
                                        Raw: {thisService.order.status} • OS:
                                        {' '}
                                        {ORDER_STATUS_LABELS[thisService.order.status] || '—'} • ES:
                                        {' '}
                                        {EVENT_STATUS_LABELS[thisService.order.status] || '—'}
                                    </div>

                                    {thisService.statusError && (
                                        <div className="mt-2">
                                            <ErrorComponent>{thisService.statusError}</ErrorComponent>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Events</h3>

                                    <Button
                                        type="button"
                                        variant="soft"
                                        color="emerald"
                                        onClick={() => setOpenCreateEvent(true)}
                                    >
                                        Add event
                                    </Button>
                                </div>

                                {eventsSorted.length === 0 ? (
                                    <div className="py-4 text-sm text-gray-500">No events yet</div>
                                ) : (
                                    <ul className="space-y-3">
                                        {eventsSorted.map((ev) => (
                                            <li
                                                key={ev._id}
                                                className="rounded-xl border border-gray-200 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-xs text-gray-500">
                                                            {formatDateTime(ev.createdAt)}
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {EVENT_STATUS_LABELS[ev.status] || String(ev.status)}
                                                            {' '}({ev.status})
                                                        </div>
                                                        <div className="text-xs text-gray-600 break-words">
                                                            {formatLocation(ev.location)}
                                                        </div>
                                                        {ev.description && (
                                                            <div className="mt-1 text-sm text-gray-800 break-words">
                                                                {ev.description}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        variant="soft"
                                                        color="danger"
                                                        onClick={() => openDeleteEventModal(ev)}
                                                        className="shrink-0"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <div className="h-6" />
                        </div>
                    )}

                    <CreateEventModal
                        open={openCreateEvent}
                        orderId={orderId}
                        onClose={() => setOpenCreateEvent(false)}
                        onSuccess={({ order, event }) => {
                            if (order) thisService.setOrder(order)
                            if (event) thisService.setEvents([...thisService.events, event])
                            setOpenCreateEvent(false)
                            onOrderUpdated?.()
                        }}
                    />

                    <DeleteEventModal
                        open={openDeleteEvent}
                        orderId={orderId}
                        selectedEvent={selectedEvent}
                        onClose={closeDeleteEventModal}
                        onSuccess={({ order, event }) => {
                            if (order) thisService.setOrder(order)
                            if (event) thisService.setEvents(thisService.events.filter((e) => e._id !== event._id))
                            closeDeleteEventModal()
                            onOrderUpdated?.()
                        }}
                    />
                </DialogPanel>
            </div>
        </Dialog>
    )
}
