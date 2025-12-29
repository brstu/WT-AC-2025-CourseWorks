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
import { useInviteModalServices } from './invite-modal.services'
import { inviteFormFields } from './invite-modal.constants'
import { ErrorComponent } from '@/app/shared/component/error'
import { SuccessComponent } from '@/app/shared/component/success'

interface IProps {
    open: boolean
    onClose: () => void
}

export const InviteModal = ({ open, onClose }: IProps) => {
    const thisService = useInviteModalServices()

    const handleClose = () => {
        thisService.clearModal()
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
                        Invite Friend
                    </DialogTitle>

                    <div className="py-4">
                        <form
                            className="max-w-[310px] m-auto"
                            onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                        >
                            <Field
                                className={clsx('form-field', thisService.errors.email && 'error')}
                            >
                                <Label className="form-field-label">Email</Label>
                                <Input
                                    className="form-field-input"
                                    {...thisService.register(
                                        inviteFormFields.email.fieldName,
                                        inviteFormFields.email.validationOptions
                                    )}
                                />
                                <Description className="form-field-error">
                                    {thisService.errors.email && thisService.errors.email.message}
                                </Description>
                            </Field>

                            {thisService.apiError && (
                                <ErrorComponent>{thisService.apiError}</ErrorComponent>
                            )}

                            {thisService.successMessage && (
                                <SuccessComponent>{thisService.successMessage}</SuccessComponent>
                            )}

                            <div className="pt-3 mt-3 border-t border-t-gray-200">
                                <Button className="w-full" isSubmiting={thisService.isSubmitting}>
                                    Invite
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="soft" color="danger" onClick={handleClose}>
                            Close
                        </Button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
