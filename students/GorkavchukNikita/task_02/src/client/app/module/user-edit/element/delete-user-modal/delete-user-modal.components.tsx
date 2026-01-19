'use client'

import { IUserAdmin } from '@/app/shared/interface'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { Button } from '@/app/shared/component/button'
import { useDeleteUserServices } from './delete-user-modal.services'
import { ErrorComponent } from '@/app/shared/component/error'

interface IProps {
    open: boolean
    selectedUser: IUserAdmin | null
    onClose: () => void
    onSuccess?: () => void
}

export const DeleteUserModal = ({ open, onClose, selectedUser, onSuccess }: IProps) => {
    const thisService = useDeleteUserServices({ selectedUser, onSuccess })

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
                        Delete Speaker
                    </DialogTitle>

                    <p className="text-center py-3.5">
                        Are you sure you want to remove the speaker:{' '}
                        <strong>{selectedUser?.name}</strong>?
                    </p>

                    {thisService.apiError && (
                        <ErrorComponent>{thisService.apiError}</ErrorComponent>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="soft" color="danger" onClick={handleClose}>
                            Close
                        </Button>

                        <Button
                            type="submit"
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
