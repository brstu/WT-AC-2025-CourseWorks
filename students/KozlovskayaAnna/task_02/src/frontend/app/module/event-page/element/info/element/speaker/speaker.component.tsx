'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { ChevronDown, Mail, Phone } from 'lucide-react'
import { TelegramIcon } from '@/app/shared/icons/telegram/'
import { IEventSpeaker } from '@/app/shared/interface/'

import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'
import { Button } from '@/app/shared/component/button'

import { useSpeakerSevices } from './speaker.services'

interface IProps {
    speaker: IEventSpeaker
}

export const SpeakerComponent = ({ speaker }: IProps) => {
    const thisService = useSpeakerSevices()

    return (
        <div className="grid grid-cols-[64px_1fr] gap-2.5">
            <div className="size-16 rounded-full overflow-hidden">
                <Image
                    width={64}
                    height={64}
                    // src={'/speaker-test.jpg'}
                    src={`${PUBLIC_URLS.imagesSpeakers}/${speaker.photo.name}`}
                    alt={speaker.photo.alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
            <div className="flex flex-col">
                <h4 className="break-all font-bold mb-1.5">{speaker.name}</h4>
                {thisService.showContacts && (
                    <ul className="mb-2">
                        {speaker.contacts.phone && (
                            <li>
                                <a
                                    className="text-md flex items-center gap-1 text-gray-600"
                                    href={`tel:${speaker.contacts.phone}`}
                                >
                                    <span className="size-4">
                                        <Phone className="size-4" />
                                    </span>
                                    {speaker.contacts.phone}
                                </a>
                            </li>
                        )}
                        {speaker.contacts.telegram && (
                            <li>
                                <a
                                    className="text-md flex items-center gap-1 text-gray-600"
                                    href={`https://t.me/${speaker.contacts.telegram}`}
                                >
                                    <span className="size-4">
                                        <TelegramIcon />
                                    </span>
                                    {speaker.contacts.telegram}
                                </a>
                            </li>
                        )}
                        {speaker.contacts.email && (
                            <li>
                                <a
                                    className="text-md flex items-center gap-1 text-gray-600"
                                    href={`mailto:${speaker.contacts.email}`}
                                >
                                    <span className="size-4">
                                        <Mail className="size-4" />
                                    </span>
                                    {speaker.contacts.email}
                                </a>
                            </li>
                        )}
                    </ul>
                )}
                <Button
                    variant="ghost"
                    color="black"
                    startIcon={ChevronDown}
                    startIconClassName={clsx(
                        'translate-y-px',
                        thisService.showContacts ? 'rotate-180' : 'rotate-0'
                    )}
                    onClick={thisService.toggleContactsView}
                >
                    {thisService.showContacts ? 'hide' : 'show contacts'}
                </Button>
            </div>
        </div>
    )
}
