import clsx from 'clsx'
import Link from 'next/link'
import { ITicket } from '@/app/shared/interface'
import { Calendar, Clock4, MapPin } from 'lucide-react'
import {
    formatDateToMonth,
    formatDateToTime,
} from '@/app/shared/component/event-card/event-card.utils'

interface IProps {
    ticket: ITicket
}

export const TicketCardComponent = ({ ticket }: IProps) => {
    return (
        <Link href={`/events/${ticket.event._id}`} className="group">
            <div
                className={clsx(
                    'px-3 py-5 border border-gray-200 rounded-xl',
                    'group-hover:-translate-y-2 transition-transform'
                )}
            >
                <h3 className="text-center font-bold mb-1">{ticket.event.title}</h3>

                <div className="flex flex-col mb-5">
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin width={12} height={12} />
                        <span className="flex-1 line-clamp-1">{ticket.event.venue}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar width={12} height={12} />
                        <span className="flex-1 line-clamp-1">
                            {formatDateToMonth(ticket.event.startsAt)}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock4 width={12} height={12} />
                        <span className="flex-1 line-clamp-1">
                            {formatDateToTime(ticket.event.startsAt)}
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <h4 className="inline-block py-2 px-5 bg-black text-white text-xl font-bold tracking-widest rounded-md">
                        {ticket.code}
                    </h4>
                </div>
            </div>
        </Link>
    )
}
