'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'

import { Button } from '@/app/shared/component/button'
import { ErrorComponent } from '@/app/shared/component/error'

import type { IOrderEventAdmin } from '../../../../order-edit.types'
import { EVENT_STATUS_LABELS } from '../../../../order-edit.constants'
import { formatLocation, formatDateTime } from '../../../../order-edit.utils'

import { useDeleteEventServices } from './delete-event-modal.services'

interface IProps {
    open: boolean
    orderId: string | null
    selectedEvent: IOrderEventAdmin | null
    onClose: () => void
    onSuccess?: (payload: { order?: any; event?: any }) => void
}

export const DeleteEventModal = ({ open, orderId, selectedEvent, onClose, onSuccess }: IProps) => {
    const thisService = useDeleteEventServices({ orderId, selectedEvent, onSuccess })

    const handleClose = () => {
        onClose?.()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {/* See CreateEventModal: this modal can be opened from inside the OrderDrawer */}
            <DialogBackdrop transition className="modal-backdrop z-[60]" />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">
                        Delete Event
                    </DialogTitle>

                    <div className="py-3.5 text-sm text-gray-700">
                        <div>
                            <span className="text-gray-500">Status:</span>{' '}
                            <strong>
                                {selectedEvent
                                    ? `${EVENT_STATUS_LABELS[selectedEvent.status] || selectedEvent.status} (${selectedEvent.status})`
                                    : ''}
                            </strong>
                        </div>
                        <div>
                            <span className="text-gray-500">Location:</span>{' '}
                            <strong>{formatLocation(selectedEvent?.location)}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500">Created:</span>{' '}
                            <strong>{selectedEvent ? formatDateTime(selectedEvent.createdAt) : ''}</strong>
                        </div>

                        <p className="mt-3 text-center">
                            Are you sure you want to remove this event?
                        </p>
                    </div>

                    {thisService.apiError && <ErrorComponent>{thisService.apiError}</ErrorComponent>}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="soft" color="danger" onClick={handleClose}>
                            Close
                        </Button>

                        <Button
                            type="button"
                            color="danger"
                            isSubmiting={thisService.loading}
                            onClick={() => thisService.handleSubmit()}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
