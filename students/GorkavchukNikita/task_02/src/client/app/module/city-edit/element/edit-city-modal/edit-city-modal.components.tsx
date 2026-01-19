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
import { ICity } from '@/app/shared/interface'

import { useEditCityServices } from './edit-city-modal.services'
import { editCityFormFields } from './edit-city-modal.constants'

interface IProps {
    open: boolean
    selectedCity: ICity | null
    onClose: () => void
    onSuccess?: () => void
}

export const EditCityModal = ({ open, onClose, selectedCity, onSuccess }: IProps) => {
    const thisService = useEditCityServices({ onSuccess, selectedCity, open })

    const handleClose = () => {
        onClose?.()
    }

    const isSubmitDisabled =
        thisService.countriesLoading || thisService.countries.length === 0 || !selectedCity

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogBackdrop transition className="modal-backdrop" />

            <div className="fixed inset-0 flex items-start p-4 z-50">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">
                        Edit City
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
                                    editCityFormFields.name.fieldName,
                                    editCityFormFields.name.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.name && thisService.errors.name.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx('form-field', thisService.errors.cityCode && 'error')}
                        >
                            <Label className="form-field-label">City code</Label>
                            <Input
                                className="form-field-input"
                                autoCapitalize="characters"
                                {...thisService.register(
                                    editCityFormFields.cityCode.fieldName,
                                    editCityFormFields.cityCode.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.cityCode && thisService.errors.cityCode.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx(
                                'form-field',
                                thisService.errors.countryId && 'error'
                            )}
                        >
                            <Label className="form-field-label">Country</Label>
                            <select
                                className="form-field-input"
                                {...thisService.register(
                                    editCityFormFields.countryId.fieldName,
                                    editCityFormFields.countryId.validationOptions
                                )}
                            >
                                <option value="" disabled>
                                    Select country
                                </option>

                                {thisService.countries.map((country) => (
                                    <option key={country._id} value={country._id}>
                                        {country.name} ({country.countryCode})
                                    </option>
                                ))}
                            </select>

                            <Description className="form-field-error">
                                {thisService.errors.countryId && thisService.errors.countryId.message}
                                {!thisService.errors.countryId && thisService.countriesLoading
                                    ? 'Loading countries...'
                                    : null}
                                {!thisService.errors.countryId && thisService.countriesError
                                    ? thisService.countriesError
                                    : null}
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

                            <Button
                                type="submit"
                                disabled={isSubmitDisabled}
                                isSubmiting={thisService.isSubmitting}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    )
}
