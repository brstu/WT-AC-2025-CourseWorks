import clsx from 'clsx'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Calendar, Clock4, MapPin } from 'lucide-react'

import { formatDateToMonth, formatDateToTime } from './event-card.utils'
// import { Button } from '@/app/shared/component/button'

import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'

interface IProps {
    id: string
    title: string
    cover: {
        name: string
        alt?: string
    }
    venue: string
    startsAt: string
}

export const EventCard = ({ id, title, cover, venue, startsAt }: IProps) => {
    return (
        <Link href={`/events/${encodeURI(id)}`} className="inline-block group">
            <div className="flex border border-gray-200 rounded-[14px] overflow-hidden">
                <div
                    className={clsx(
                        'bg-gray-600 w-[100px] h-[180px] flex-none transition-all duration-500',
                        'group-hover:w-0 group-hover:opacity-0'
                    )}
                >
                    <Image
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        width={100}
                        height={180}
                        src={`${PUBLIC_URLS.imagesEvents}/${cover.name}`}
                        alt={cover.alt || ''}
                    />
                </div>
                <div className="flex flex-col p-2 flex-1">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold min-h-14 line-clamp-2 break-normal">
                            {title}
                        </h3>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin width={12} height={12} />
                            <span className="flex-1 line-clamp-1">{venue}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Calendar width={12} height={12} />
                            <span className="flex-1 line-clamp-1">
                                {formatDateToMonth(startsAt)}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Clock4 width={12} height={12} />
                            <span className="flex-1 line-clamp-1">
                                {formatDateToTime(startsAt)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto">
                        <span className="flex items-center gap-2 text-gray-500 opacity-0 duration-500 transition-opacity group-hover:opacity-100">
                            Open Event
                            <ArrowUpRight />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
