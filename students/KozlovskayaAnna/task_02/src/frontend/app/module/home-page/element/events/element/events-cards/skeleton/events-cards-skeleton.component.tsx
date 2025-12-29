import { EventCardSkeleton } from '@/app/shared/component/event-card/skeleton'

export const EventsCardsSkeleton = () => {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
                <EventCardSkeleton key={index} />
            ))}
        </div>
    )
}
