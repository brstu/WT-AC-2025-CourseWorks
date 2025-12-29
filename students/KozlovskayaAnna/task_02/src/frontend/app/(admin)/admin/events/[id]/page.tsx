'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { EventPageAdminModule } from '@/app/module/event-page-admin'
import { NotFoundModule } from '@/app/module/not-found/'
import { useGetAdminEvent } from '@/app/shared/hooks/'
import type { IEventAdmin } from '@/app/shared/interface'

export default function Page() {
    const params = useParams<{ id: string }>()

    const { isLoading, getAdminEvent } = useGetAdminEvent()
    const [event, setEvent] = useState<IEventAdmin | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const fetchEvent = async () => {
            const result = await getAdminEvent(params.id)
            setEvent(result)
            setChecked(true)
        }

        fetchEvent()
    }, [getAdminEvent, params.id])

    if (isLoading && !checked) {
        return null
    }

    if (!event) {
        return <NotFoundModule />
    }

    return <EventPageAdminModule event={event} />
}
