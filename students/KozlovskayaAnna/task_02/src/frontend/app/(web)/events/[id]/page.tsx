import { getEventServer } from '@/app/shared/services/get-event-server'
import { EventPageModule } from '@/app/module/event-page'
import { EventStoreProvider } from '@/app/shared/providers'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params }: PageProps) {
    const { id } = await params
    const eventData = await getEventServer(id)

    return (
        <EventStoreProvider
            initialEvent={eventData?.event || null}
            initialAtendee={eventData?.atendee || null}
        >
            <EventPageModule />
        </EventStoreProvider>
    )
}
