'use client'

import clsx from 'clsx'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Field,
    Label,
    Input,
    Description,
} from '@headlessui/react'
import { Button } from '@/app/shared/component/button'
import { useEditUserServices } from './edit-user-modal.services'
import { editUserFormFields } from './edit-user-modal.constants'
import { ErrorComponent } from '@/app/shared/component/error'
import { IUserAdmin } from '@/app/shared/interface'

interface IProps {
    open: boolean
    selectedUser: IUserAdmin | null
    onClose: () => void
    onSuccess?: () => void
}

export const EditUserModal = ({ open, selectedUser, onClose, onSuccess }: IProps) => {
    const thisService = useEditUserServices({ onSuccess, selectedUser })

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
                        Create User
                    </DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field className={clsx('form-field', thisService.errors.name && 'error')}>
                            <Label className="form-field-label">Name</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editUserFormFields.name.fieldName,
                                    editUserFormFields.name.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.name && thisService.errors.name.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.email && 'error')}>
                            <Label className="form-field-label">Email</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editUserFormFields.email.fieldName,
                                    editUserFormFields.email.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.email && thisService.errors.email.message}
                            </Description>
                        </Field>

                        <div className="grid grid-cols-2 gap-3.5 py-3">
                            <button
                                type="button"
                                className={clsx(
                                    'border-2 border-black px-3 py-2 font-bold rounded-xl cursor-pointer',
                                    thisService.role === 'user' ? 'opacity-100' : 'opacity-30'
                                )}
                                onClick={() => thisService.handleSelectRole('user')}
                            >
                                user
                            </button>
                            <button
                                type="button"
                                className={clsx(
                                    'border-2 border-black px-3 py-2 font-bold rounded-xl cursor-pointer',
                                    thisService.role === 'admin' ? 'opacity-100' : 'opacity-30'
                                )}
                                onClick={() => thisService.handleSelectRole('admin')}
                            >
                                admin
                            </button>
                        </div>

                        {thisService.apiError && (
                            <ErrorComponent>{thisService.apiError}</ErrorComponent>
                        )}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="soft"
                                color="danger"
                                onClick={handleClose}
                            >
                                Close
                            </Button>

                            <Button type="submit" isSubmiting={thisService.isSubmitting}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
