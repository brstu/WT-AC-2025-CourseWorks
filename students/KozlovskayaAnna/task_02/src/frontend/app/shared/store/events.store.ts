'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface IEvent {
    _id: string
    title: string
    cover: {
        name: string
        alt?: string
    }
    venue: string
    startsAt: string
}

interface IPagination {
    limit: number
    page: number
    total: number
    hasMore: boolean
}

interface EventsState {
    events: IEvent[]
    pagination: IPagination | null

    setEvents: (events: IEvent[]) => void
    setPagination: (pagination: IPagination) => void

    clearEvents: () => void
    clearPagination: () => void
}

export const useEventsStore = create<EventsState>()(
    devtools(
        (set) => ({
            events: [],
            pagination: null,

            setEvents: (events) => set({ events }),
            setPagination: (pagination) => set({ pagination }),

            clearEvents: () => set({ events: [] }),
            clearPagination: () => set({ pagination: null }),
        }),
        {
            name: 'EventsStore',
            enabled: process.env.NODE_ENV !== 'production' && typeof window !== 'undefined',
        }
    )
)
