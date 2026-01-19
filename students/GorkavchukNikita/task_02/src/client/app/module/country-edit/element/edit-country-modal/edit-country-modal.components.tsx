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
import { ICountry } from '@/app/shared/interface'

import { useEditCountryServices } from './edit-country-modal.services'
import { editCountryFormFields } from './edit-country-modal.constants'

interface IProps {
    open: boolean
    selectedCountry: ICountry | null
    onClose: () => void
    onSuccess?: () => void
}

export const EditCountryModal = ({
    open,
    selectedCountry,
    onClose,
    onSuccess,
}: IProps) => {
    const thisService = useEditCountryServices({ onSuccess, selectedCountry })

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
                        Edit Country
                    </DialogTitle>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field
                            className={clsx('form-field', thisService.errors.name && 'error')}
                        >
                            <Label className="form-field-label">Name</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    editCountryFormFields.name.fieldName,
                                    editCountryFormFields.name.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.name && thisService.errors.name.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx(
                                'form-field',
                                thisService.errors.countryCode && 'error'
                            )}
                        >
                            <Label className="form-field-label">Country code</Label>
                            <Input
                                className="form-field-input"
                                autoCapitalize="characters"
                                {...thisService.register(
                                    editCountryFormFields.countryCode.fieldName,
                                    editCountryFormFields.countryCode.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.countryCode &&
                                    thisService.errors.countryCode.message}
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
