'use client'

import clsx from 'clsx'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
    Field,
    Label,
    Description,
    Textarea,
} from '@headlessui/react'

import { Button } from '@/app/shared/component/button'
import { ErrorComponent } from '@/app/shared/component/error'

import { EVENT_STATUS_OPTIONS } from '../../../../order-edit.constants'
import { useCreateEventServices } from './create-event-modal.services'
import { createEventFormFields } from './create-event-modal.constants'

interface IProps {
    open: boolean
    orderId: string | null
    onClose: () => void
    onSuccess?: (payload: { order?: any; event?: any }) => void
}

export const CreateEventModal = ({ open, orderId, onClose, onSuccess }: IProps) => {
    const thisService = useCreateEventServices({ open, orderId, onSuccess })

    const handleClose = () => {
        onClose?.()
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            {/*
                This modal can be opened from inside the OrderDrawer (another Dialog).
                We need a higher z-index so the backdrop and panel fully cover the drawer.
            */}
            <DialogBackdrop transition className="modal-backdrop z-[60]" />

            <div className="fixed inset-0 flex items-center justify-center p-4 z-[70]">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">Add Event</DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field
                            className={clsx('form-field', thisService.errors.location && 'error')}
                        >
                            <Label className="form-field-label">Location</Label>

                            <select
                                className="form-field-input"
                                defaultValue=""
                                {...thisService.register(
                                    createEventFormFields.location.fieldName,
                                    createEventFormFields.location.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select location
                                </option>

                                {thisService.locationOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.location && thisService.errors.location.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.status && 'error')}>
                            <Label className="form-field-label">Status (ES)</Label>

                            <select
                                className="form-field-input"
                                defaultValue=""
                                {...thisService.register(
                                    createEventFormFields.status.fieldName,
                                    createEventFormFields.status.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select status
                                </option>

                                {EVENT_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label} ({opt.value})
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.status && thisService.errors.status.message}
                            </Description>
                        </Field>

                        <Field className="form-field">
                            <Label className="form-field-label">Description (optional)</Label>

                            <Textarea
                                className="form-field-input"
                                rows={3}
                                {...thisService.register(createEventFormFields.description.fieldName)}
                            />

                            <Description className="form-field-error" />
                        </Field>

                        {thisService.lookupsLoading && (
                            <div className="text-xs text-gray-500 pb-2">Loading locations...</div>
                        )}

                        {thisService.lookupsError && <ErrorComponent>{thisService.lookupsError}</ErrorComponent>}

                        {thisService.apiError && <ErrorComponent>{thisService.apiError}</ErrorComponent>}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="soft" color="danger" onClick={handleClose}>
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
