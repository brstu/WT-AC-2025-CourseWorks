'use client'

import { createContext, useContext, useMemo, ReactNode } from 'react'
import { IEvent, IAtendee } from '@/app/shared/interface'
import { createEventStore, EventState } from '@/app/shared/store/event.store'
import { useStore } from 'zustand'

type EventStore = ReturnType<typeof createEventStore>

const EventStoreContext = createContext<EventStore | null>(null)

interface Props {
    initialEvent: IEvent | null
    initialAtendee?: IAtendee | null
    children: ReactNode
}

export const EventStoreProvider = ({
    initialEvent = null,
    initialAtendee = null,
    children,
}: Props) => {
    const store = useMemo(
        () =>
            createEventStore({
                event: initialEvent,
                atendee: initialAtendee,
            }),
        [initialEvent, initialAtendee]
    )

    return <EventStoreContext.Provider value={store}>{children}</EventStoreContext.Provider>
}

export const useEventStoreContext = <T,>(selector: (state: EventState) => T): T => {
    const store = useContext(EventStoreContext)

    if (!store) {
        throw new Error('useEventStoreContext must be used inside <EventStoreProvider>')
    }

    return useStore(store, selector)
}
