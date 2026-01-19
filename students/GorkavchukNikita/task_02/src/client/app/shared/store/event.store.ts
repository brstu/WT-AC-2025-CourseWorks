import { createStore } from 'zustand/vanilla'
import { devtools } from 'zustand/middleware'
import { IEvent, IAtendee } from '@/app/shared/interface'

export interface EventState {
    event: IEvent | null
    atendee: IAtendee | null
    setEvent: (event: IEvent | null) => void
    setAtendee: (atendee: IAtendee | null) => void
    clearEvent: () => void
    clearAtendee: () => void
}

interface IInitialState {
    event: IEvent | null
    atendee: IAtendee | null
}

export const createEventStore = (initialState: IInitialState) =>
    createStore<EventState>()(
        devtools(
            (set) => ({
                event: initialState.event,
                atendee: initialState.atendee,
                setEvent: (event) => set({ event }),
                setAtendee: (atendee) => set({ atendee }),
                clearEvent: () => set({ event: null }),
                clearAtendee: () => set({ atendee: null }),
            }),
            {
                name: 'EventStore',
                enabled: process.env.NODE_ENV !== 'production' && typeof window !== 'undefined',
            }
        )
    )
