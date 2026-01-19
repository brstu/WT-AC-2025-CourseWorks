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
import { useResetPasswordServices } from './reset-password-modal.services'
import { resetPasswordFormFields } from './reset-password-modal.constants'
import { ErrorComponent } from '@/app/shared/component/error'
import { IUserAdmin } from '@/app/shared/interface'

interface IProps {
    open: boolean
    selectedUser: IUserAdmin | null
    onClose: () => void
    onSuccess?: () => void
}

export const ResetPasswordModal = ({ open, selectedUser, onClose, onSuccess }: IProps) => {
    const thisService = useResetPasswordServices({ onSuccess, selectedUser })

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
                        Change Password
                    </DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field
                            className={clsx('form-field', thisService.errors.password && 'error')}
                        >
                            <Label className="form-field-label">New Password</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    resetPasswordFormFields.password.fieldName,
                                    resetPasswordFormFields.password.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.password && thisService.errors.password.message}
                            </Description>
                        </Field>

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
