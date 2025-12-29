'use client'

import Image from 'next/image'
import clsx from 'clsx'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'
import { IEventAdmin } from '@/app/shared/interface'
import { Field, Input, Label, Textarea } from '@headlessui/react'
import { useEventPageAdminServices } from './event-page-admin.services'
import { SpeakersList } from './element/speaker-list/'
import { SpeakerItem } from './element/speaker-item/'
import { ErrorComponent } from '@/app/shared/component/error'
import { ConfirmModal } from './element/confirm-modal'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'

interface IProps {
    event: IEventAdmin | null
}

export const EventPageAdminModule = ({ event }: IProps) => {
    const thisService = useEventPageAdminServices({ event })

    // const coverSrc = thisService.coverPreviewUrl || '/test-cover.webp'
    const coverSrc =
        thisService.coverPreviewUrl || `${PUBLIC_URLS.imagesEvents}/${event?.cover.name}`

    return (
        <WrapperComponent className="py-6">
            <div className="flex w-full mb-5">
                <Link href={`/events/${event?._id || ''}/`}>
                    <Button variant="ghost" startIcon={ArrowLeft}>
                        Back
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
                <div className="flex flex-col gap-2">
                    <Field className="form-field">
                        <Label className="form-field-label">Cover</Label>

                        <div className="flex flex-col gap-3 items-start">
                            <div className="w-full">
                                <label
                                    className={clsx(
                                        'flex items-center flex-col justify-center w-full rounded-md p-2',
                                        'cursor-pointer bg-gray-0',
                                        'hover:bg-gray-200 transition-colors'
                                    )}
                                    htmlFor="event-admin-file-choose"
                                >
                                    <div className="w-[224px] h-[300px] overflow-hidden bg-gray-200 rounded-md">
                                        <Image
                                            width={240}
                                            height={300}
                                            src={coverSrc}
                                            alt={thisService?.coverAlt || ''}
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
                                    id="event-admin-file-choose"
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
                    </Field>
                    <Field className={'form-field'}>
                        <Label className="form-field-label">Cover Alt text</Label>
                        <Input
                            className="form-field-input"
                            value={thisService.coverAlt}
                            onChange={thisService.altCoverChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                    <Field className={'form-field'}>
                        <Label className="form-field-label">Venue</Label>
                        <Input
                            className="form-field-input"
                            value={thisService.venue}
                            onChange={thisService.venueChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                    <Field className={'form-field'}>
                        <Label className="form-field-label">Capacity</Label>
                        <Input
                            type="number"
                            className="form-field-input"
                            value={thisService.capacity}
                            onChange={thisService.capacityChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                    <Field className="form-field">
                        <Label className="form-field-label">Starts at</Label>
                        <Input
                            type="datetime-local"
                            className="form-field-input"
                            value={thisService.startsAt}
                            onChange={thisService.startsAtChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                    <Field className="form-field">
                        <Label className="form-field-label">Ends at</Label>
                        <Input
                            type="datetime-local"
                            className="form-field-input"
                            value={thisService.endsAt}
                            onChange={thisService.endsAtChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                </div>
                <div className="flex flex-col gap-2">
                    <Field className={'form-field'}>
                        <Label className="form-field-label">Title</Label>
                        <Input
                            className="form-field-input"
                            value={thisService.title}
                            onChange={thisService.titleChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                    <Field>
                        <Label className="form-field-label">Selected Speakers</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {thisService.speakers.map((item) => {
                                return (
                                    <div
                                        key={`selected_speaker_${item._id}`}
                                        onClick={() => thisService.removeSpeaker(item._id)}
                                        className="cursor-pointer"
                                    >
                                        <SpeakerItem speaker={item} />
                                    </div>
                                )
                            })}
                        </div>
                    </Field>
                    <Field>
                        <Label className="form-field-label">Availiable Speakers</Label>
                        <SpeakersList
                            addSpeaker={thisService.addSpeaker}
                            removeSpeaker={thisService.removeSpeaker}
                            selectedSpeakers={thisService.speakers}
                        />
                    </Field>
                    <Field className={'form-field'}>
                        <Label className="form-field-label">Content</Label>
                        <Textarea
                            className="form-field-textarea"
                            value={thisService.contentMd}
                            onChange={thisService.contentMdChangeHandler}
                            disabled={thisService.isLoading}
                        />
                    </Field>
                </div>
            </div>
            <div className="flex justify-end mt-5 gap-4">
                <Button
                    color="danger"
                    variant="soft"
                    disabled={thisService.isLoading}
                    onClick={thisService.handleOpenModal}
                >
                    Delete Event
                </Button>
                <Button onClick={thisService.submitChanges} disabled={thisService.isLoading}>
                    Save Changes
                </Button>
            </div>
            {thisService.error && (
                <div className="mt-7">
                    <ErrorComponent>{thisService.error}</ErrorComponent>
                </div>
            )}
            <ConfirmModal
                open={thisService.confirmModalOpen}
                onClose={thisService.handleCloseModal}
                event={event}
            />
        </WrapperComponent>
    )
}
