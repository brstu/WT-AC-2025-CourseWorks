'use client'

import { EventCard } from '@/app/shared/component/event-card'
import { Button } from '@/app/shared/component/button'
import { ErrorComponent } from '@/app/shared/component/error'
import { RefreshCcw } from 'lucide-react'

import { useEventsCardsServices } from './events-cards.services'

import { EventsCardsSkeleton } from './skeleton'

export const EventsCardsComponent = () => {
    const thisService = useEventsCardsServices()

    if (thisService.isFirstFetching && !thisService.error) {
        return <EventsCardsSkeleton />
    }

    if (thisService.error) {
        return (
            <div className="flex items-center flex-col justify-center">
                <ErrorComponent>{thisService.error}</ErrorComponent>
                <Button
                    onClick={thisService.tryAgain}
                    className="mt-3"
                    startIcon={RefreshCcw}
                    isSubmiting={thisService.isFetchingMore}
                >
                    Load More
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {thisService.events.map((event) => (
                    <EventCard
                        key={event._id}
                        id={event._id}
                        title={event.title}
                        venue={event.venue}
                        cover={{
                            name: event.cover.name,
                            alt: event.cover.alt || '',
                        }}
                        startsAt={event.startsAt}
                    />
                ))}
            </div>
            {thisService.pagination?.hasMore && (
                <div className="col-span-3 flex items-center justify-center py-4">
                    <Button
                        onClick={thisService.fetchMore}
                        className="w-3xs"
                        isSubmiting={thisService.isFetchingMore}
                    >
                        Load More
                    </Button>
                </div>
            )}
        </div>
    )
}
