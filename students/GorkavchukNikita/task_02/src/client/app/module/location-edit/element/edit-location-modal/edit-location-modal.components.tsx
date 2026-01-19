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
import { ILocation } from '@/app/shared/interface'

import { useEditLocationServices } from './edit-location-modal.services'
import { editLocationFormFields } from './edit-location-modal.constants'

interface IProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
    selectedLocation: ILocation | null
}

const LOCATION_TYPE_OPTIONS = [
    { value: 0, label: 'warehouse' },
    { value: 1, label: 'sort_center' },
    { value: 2, label: 'pickup_point' },
    { value: 3, label: 'locker' },
    { value: 4, label: 'hub' },
]

export const EditLocationModal = ({ open, onClose, onSuccess, selectedLocation }: IProps) => {
    const thisService = useEditLocationServices({ onSuccess, open, selectedLocation })

    const handleClose = () => {
        onClose?.()
    }

    const isSubmitDisabled =
        !selectedLocation || thisService.citiesLoading || thisService.cityOptions.length === 0

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogBackdrop transition className="modal-backdrop" />

            <div className="fixed inset-0 flex items-start p-4 z-50">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">Edit Location</DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field className={clsx('form-field', thisService.errors.type && 'error')}>
                            <Label className="form-field-label">Location Type</Label>
                            <select
                                className="form-field-input"
                                {...thisService.register(
                                    editLocationFormFields.type.fieldName,
                                    editLocationFormFields.type.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select type
                                </option>
                                {LOCATION_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <Description className="form-field-error">
                                {thisService.errors.type && thisService.errors.type.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.label && 'error')}>
                            <Label className="form-field-label">Label</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editLocationFormFields.label.fieldName,
                                    editLocationFormFields.label.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.label && thisService.errors.label.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx('form-field', thisService.errors.locationCode && 'error')}
                        >
                            <Label className="form-field-label">Location Code</Label>
                            <Input
                                className="form-field-input"
                                autoCapitalize="characters"
                                {...thisService.register(
                                    editLocationFormFields.locationCode.fieldName,
                                    editLocationFormFields.locationCode.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.locationCode && thisService.errors.locationCode.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.cityId && 'error')}>
                            <Label className="form-field-label">City</Label>
                            <select
                                className="form-field-input"
                                {...thisService.register(
                                    editLocationFormFields.cityId.fieldName,
                                    editLocationFormFields.cityId.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select city
                                </option>

                                {thisService.cityOptions.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.label}
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.cityId && thisService.errors.cityId.message}
                                {!thisService.errors.cityId && thisService.citiesLoading
                                    ? 'Loading cities...'
                                    : null}
                                {!thisService.errors.cityId && thisService.citiesError
                                    ? thisService.citiesError
                                    : null}
                            </Description>
                        </Field>

                        <Field
                            className={clsx('form-field', thisService.errors.postalCode && 'error')}
                        >
                            <Label className="form-field-label">Postal code</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editLocationFormFields.postalCode.fieldName,
                                    editLocationFormFields.postalCode.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.postalCode && thisService.errors.postalCode.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.street && 'error')}>
                            <Label className="form-field-label">Street</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editLocationFormFields.street.fieldName,
                                    editLocationFormFields.street.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.street && thisService.errors.street.message}
                            </Description>
                        </Field>

                        {thisService.apiError && <ErrorComponent>{thisService.apiError}</ErrorComponent>}

                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="soft" color="danger" onClick={handleClose}>
                                Close
                            </Button>

                            <Button type="submit" disabled={isSubmitDisabled} isSubmiting={thisService.isSubmitting}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
