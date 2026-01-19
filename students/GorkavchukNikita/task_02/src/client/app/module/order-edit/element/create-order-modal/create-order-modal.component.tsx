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
import { ErrorComponent } from '@/app/shared/component/error'

import { useCreateOrderServices } from './create-order-modal.services'
import { createOrderFormFields } from './create-order-modal.constants'

interface IProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

export const CreateOrderModal = ({ open, onClose, onSuccess }: IProps) => {
    const thisService = useCreateOrderServices({ onSuccess, open })

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
                        Create Order
                    </DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field
                            className={clsx(
                                'form-field',
                                thisService.errors.name && 'error'
                            )}
                        >
                            <Label className="form-field-label">Name</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createOrderFormFields.name.fieldName,
                                    createOrderFormFields.name.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.name && thisService.errors.name.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx(
                                'form-field',
                                thisService.errors.userId && 'error'
                            )}
                        >
                            <Label className="form-field-label">User</Label>

                            <select
                                className="form-field-input"
                                defaultValue=""
                                {...thisService.register(
                                    createOrderFormFields.userId.fieldName,
                                    createOrderFormFields.userId.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select user
                                </option>
                                {thisService.usersOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.userId && thisService.errors.userId.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx(
                                'form-field',
                                thisService.errors.pickupLocation && 'error'
                            )}
                        >
                            <Label className="form-field-label">Pickup Location</Label>

                            <select
                                className="form-field-input"
                                defaultValue=""
                                {...thisService.register(
                                    createOrderFormFields.pickupLocation.fieldName,
                                    createOrderFormFields.pickupLocation.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select pickup location
                                </option>
                                {thisService.locationsOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.pickupLocation &&
                                    thisService.errors.pickupLocation.message}
                            </Description>
                        </Field>

                        <Field className="form-field">
                            <Label className="form-field-label">Current Location (optional)</Label>

                            <select
                                className="form-field-input"
                                defaultValue=""
                                {...thisService.register(createOrderFormFields.currentLocation.fieldName)}
                            >
                                <option value="">
                                    Same as pickup
                                </option>
                                {thisService.locationsOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error" />
                        </Field>

                        {thisService.lookupsLoading && (
                            <div className="text-xs text-gray-500 pb-2">Loading users/locations...</div>
                        )}

                        {thisService.lookupsError && (
                            <ErrorComponent>{thisService.lookupsError}</ErrorComponent>
                        )}

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
