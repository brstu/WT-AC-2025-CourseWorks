'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/app/shared/component/button'

import { ITicket } from '@/app/shared/interface'
import { useTicketsPageServices } from './tickets-page.services'

import { TicketCardComponent } from './elemet/ticket-card'

interface IProps {
    tickets: ITicket[]
}

export const TicketsPageModule = ({ tickets }: IProps) => {
    const thisService = useTicketsPageServices({ tickets })

    return (
        <div className="max-w-96 sm:max-w-3xl m-auto py-10 px-2">
            <div className="flex gap-2 mb-4">
                <Link href={`/`}>
                    <Button variant="ghost" startIcon={ArrowLeft}>
                        Back
                    </Button>
                </Link>
            </div>

            {thisService.ticketsLocal.length === 0 ? (
                <div className="text-center">
                    <h3 className="font-bold text-2xl">No Tickets</h3>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mx-auto">
                    {thisService.ticketsLocal.map((item) => (
                        <TicketCardComponent key={item._id} ticket={item} />
                    ))}
                </div>
            )}
        </div>
    )
}
