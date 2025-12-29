'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@/app/shared/component/button'
import { IEvent } from '@/app/shared/interface'
import { useInviteModalServices } from './confirm-modal.services'
import { ErrorComponent } from '@/app/shared/component/error'

interface IProps {
    event: IEvent | null
    open: boolean
    onClose: () => void
}

export const ConfirmModal = ({ event, open, onClose }: IProps) => {
    const thisService = useInviteModalServices({ event })

    const handleClose = () => {
        onClose?.()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogBackdrop transition className="modal-backdrop" />

            <div className="fixed inset-0 flex items-start p-4 z-50">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">
                        Delete Event
                    </DialogTitle>

                    <div className="py-4">
                        <p className="text-center">
                            Are you sure you want to delete the event:{' '}
                            <strong>{event?.title}</strong>?
                        </p>

                        {thisService.apiError && (
                            <ErrorComponent>{thisService.apiError}</ErrorComponent>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="soft" color="danger" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onClick={thisService.deleteEvent}
                            isSubmiting={thisService.isLoading}
                        >
                            Delete Event
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
