'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Share, Pen, Ticket, TicketX, Clock, Building2 } from 'lucide-react'
import { ErrorComponent } from '@/app/shared/component/error'

import { Button } from '@/app/shared/component/button'
import { SpeakerComponent } from './element/speaker'
import { USER_ROLES } from '@/app/constants/user-roles'
import { useEventStoreContext } from '@/app/shared/providers'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'
import { formatDateReadable } from '@/app/shared/utils'

interface IProps {
    role: string

    joinPending: boolean
    joinError: string

    unregisterPending: boolean
    unregisterError: string

    handleJoin: () => void
    handleUnregister: () => void

    handleOpenInviteModal: () => void
}

export const InfoComponent = ({
    role,
    joinError,
    handleJoin,
    joinPending,
    handleUnregister,
    unregisterPending,
    unregisterError,
    handleOpenInviteModal,
}: IProps) => {
    const event = useEventStoreContext((state) => state.event)
    const atendee = useEventStoreContext((state) => state.atendee)

    return (
        <div className="flex flex-col max-w-96 w-full md:max-w-full mb-10 mx-auto md:mb-0 md:mx-0">
            <div className="w-[240px] h-[300px] overflow-hidden bg-gray-400 rounded-md mb-3 mx-auto">
                <Image
                    width={240}
                    height={300}
                    src={`${PUBLIC_URLS.imagesEvents}/${event?.cover.name}`}
                    // src={'/test-cover.webp'}
                    alt={event?.cover.alt || ''}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>

            <div className="flex flex-col mb-5">
                <div className="grid grid-cols-[16px_1fr] gap-2 mb-2 font-bold">
                    <Clock className="size-4 translate-y-1" />
                    Date of the event
                </div>
                <p className="text-center leading-none">
                    {event?.startsAt && formatDateReadable(event.startsAt)}
                    <br />
                    <span className="leading-none">-</span>
                    <br />
                    {event?.endsAt && formatDateReadable(event.endsAt)}
                </p>
            </div>

            <div className="grid grid-cols-[16px_1fr] gap-2 font-bold mb-5">
                <Building2 className="size-4 translate-y-1" />
                {event?.venue}
            </div>

            {!atendee && (
                <div className="mb-3">
                    <Button
                        isSubmiting={joinPending}
                        onClick={handleJoin}
                        startIcon={Ticket}
                        className="w-full"
                    >
                        Join Event
                    </Button>
                    {joinError && <ErrorComponent className="mt-1.5">{joinError}</ErrorComponent>}
                </div>
            )}
            {atendee && (
                <div className="mb-3">
                    <Button
                        isSubmiting={unregisterPending}
                        onClick={handleUnregister}
                        color="rose"
                        startIcon={TicketX}
                        className="w-full"
                    >
                        Unregister from event
                    </Button>
                    {unregisterError && (
                        <ErrorComponent className="mt-1.5">{unregisterError}</ErrorComponent>
                    )}
                    <Button
                        isSubmiting={unregisterPending}
                        onClick={handleOpenInviteModal}
                        color="indigo"
                        variant="soft"
                        startIcon={Share}
                        className="w-full mt-2"
                    >
                        Invite friend
                    </Button>
                </div>
            )}

            {role === USER_ROLES.ADMIN && (
                <Link href={`/admin/events/${event?._id}`}>
                    <Button startIcon={Pen} className="w-full mb-3">
                        Edit Event
                    </Button>
                </Link>
            )}

            <h3 className="text-md text-center font-bold mb-4">
                {event?.speakers.length === 1 ? 'Speaker' : 'Speakers'}
            </h3>
            <div className="w-full flex flex-col gap-4">
                {event?.speakers.map((s) => (
                    <SpeakerComponent key={s._id} speaker={s} />
                ))}
            </div>
        </div>
    )
}
