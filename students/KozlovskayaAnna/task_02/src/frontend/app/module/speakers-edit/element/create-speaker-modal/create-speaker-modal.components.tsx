'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { X } from 'lucide-react'
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
import { useCreateSpeakerServices } from './create-speaker-modal.services'
import { createSpeakerFormFields } from './create-speaker-modal.constants'
import { ErrorComponent } from '@/app/shared/component/error'

interface IProps {
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

export const CreateSpeakerModal = ({ open, onClose, onSuccess }: IProps) => {
    const thisService = useCreateSpeakerServices({ onSuccess })

    const handleClose = () => {
        onClose?.()
    }

    const coverSrc = thisService.coverPreviewUrl || '/test-cover.webp'
    // const coverSrc =
    //     thisService.coverPreviewUrl || `${PUBLIC_URLS.imagesEvents}/${event.cover.name}`

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogBackdrop transition className="modal-backdrop" />

            <div className="fixed inset-0 flex items-start p-4 z-50">
                <DialogPanel
                    transition
                    className="w-full max-w-md rounded-2xl bg-white p-6 m-auto data-[closed]:opacity-0 data-[closed]:translate-y-4 transition"
                >
                    <DialogTitle className="text-lg font-semibold text-center">
                        Create Speaker
                    </DialogTitle>

                    <div>
                        <div className="flex flex-col gap-3 items-start">
                            <div className="w-full">
                                <label
                                    className={clsx(
                                        'flex items-center flex-col justify-center w-full rounded-md p-2',
                                        'cursor-pointer bg-gray-0',
                                        'hover:bg-gray-200 transition-colors'
                                    )}
                                    htmlFor="create-speaker-file-choose"
                                >
                                    <div className="size-[64px] overflow-hidden bg-gray-200 rounded-full">
                                        <Image
                                            width={64}
                                            height={64}
                                            src={coverSrc}
                                            alt={''}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2">
                                        {thisService.coverFile
                                            ? `File: ${thisService?.coverFile.name}`
                                            : 'Choose File'}
                                    </p>
                                </label>
                                <input
                                    id="create-speaker-file-choose"
                                    type="file"
                                    accept="image/*"
                                    onChange={thisService.coverFileChangeHandler}
                                    className="text-sm hidden"
                                />
                            </div>
                        </div>

                        {thisService.coverFile && (
                            <div className="flex justify-center mt-1">
                                <Button
                                    startIcon={X}
                                    startIconClassName="translate-y-px"
                                    variant="soft"
                                    color="danger"
                                    onClick={thisService.handleClearCover}
                                >
                                    Remove File
                                </Button>
                            </div>
                        )}
                    </div>

                    <form
                        className="w-full"
                        onSubmit={thisService.validateBeforeSubmit(thisService.handleSubmit)}
                    >
                        <Field className={clsx('form-field', thisService.errors.name && 'error')}>
                            <Label className="form-field-label">Name</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.name.fieldName,
                                    createSpeakerFormFields.name.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.name && thisService.errors.name.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.bio && 'error')}>
                            <Label className="form-field-label">Bio</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.bio.fieldName,
                                    createSpeakerFormFields.bio.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.bio && thisService.errors.bio.message}
                            </Description>
                        </Field>

                        <Field
                            className={clsx('form-field', thisService.errors.telegram && 'error')}
                        >
                            <Label className="form-field-label">Telegram</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.telegram.fieldName,
                                    createSpeakerFormFields.telegram.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.telegram && thisService.errors.telegram.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.phone && 'error')}>
                            <Label className="form-field-label">Phone</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.phone.fieldName,
                                    createSpeakerFormFields.phone.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.phone && thisService.errors.phone.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.email && 'error')}>
                            <Label className="form-field-label">Email</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.email.fieldName,
                                    createSpeakerFormFields.email.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.email && thisService.errors.email.message}
                            </Description>
                        </Field>

                        <Field className={clsx('form-field', thisService.errors.alt && 'error')}>
                            <Label className="form-field-label">Image Alt</Label>
                            <Input
                                className="form-field-input"
                                {...thisService.register(
                                    createSpeakerFormFields.alt.fieldName,
                                    createSpeakerFormFields.alt.validationOptions
                                )}
                            />
                            <Description className="form-field-error">
                                {thisService.errors.alt && thisService.errors.alt.message}
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
