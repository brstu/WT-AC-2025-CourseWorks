import { useEffect, useState } from 'react'
import { useEventsStore } from '@/app/shared/store/events.store'
import { useGetEventsHook } from '@/app/shared/hooks/'

export const useEventsCardsServices = () => {
    const events = useEventsStore((state) => state.events)
    const pagination = useEventsStore((state) => state.pagination)

    const setEvents = useEventsStore((state) => state.setEvents)
    const setPagination = useEventsStore((state) => state.setPagination)

    const { getEvents, isLoading: isEventsLoading, error } = useGetEventsHook()

    const [isFirstFetching, setIsFirstFetching] = useState<boolean>(true)
    const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false)

    const tryAgain = async () => {
        setIsFirstFetching(true)

        const fetchedEvents = await getEvents(1, 6)

        setEvents([...events, ...fetchedEvents.data.events])
        setPagination(fetchedEvents.data.pagination)

        setIsFirstFetching(false)
    }

    const fetchMore = async () => {
        if (!pagination) {
            return
        }

        const nextPage = pagination.page + 1

        if (nextPage > pagination.total) {
            return
        }

        setIsFetchingMore(true)

        const fetchedEvents = await getEvents(nextPage, 6)

        setEvents([...events, ...fetchedEvents.data.events])
        setPagination(fetchedEvents.data.pagination)

        setIsFetchingMore(false)
    }

    useEffect(() => {
        const startFetchingEvents = async () => {
            const fetchedEvents = await getEvents(1, 6)

            setEvents(fetchedEvents.data.events)
            setPagination(fetchedEvents.data.pagination)
            setIsFirstFetching(false)
        }

        startFetchingEvents()
    }, [getEvents, setEvents, setPagination])

    return {
        events,
        pagination,
        isEventsLoading,
        isFirstFetching,
        fetchMore,
        isFetchingMore,
        error,
        tryAgain,
    }
}
