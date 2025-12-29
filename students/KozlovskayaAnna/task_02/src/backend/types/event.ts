import { Model } from 'mongoose'

export interface IEvent {
    _id: string
    title: string
    cover: {
        name?: string
        alt?: string
    }
    content: {
        md?: string
        html?: string
    }
    capacity: number
    venue: string
    speakers: string[]
    startsAt: Date
    endsAt: Date
}

export type PatchEventPayload = {
    id: string
    title?: string
    content?: {
        md?: string
        html?: string
    }
    capacity?: number
    cover?: {
        name?: string
        alt?: string
    }
    speakers?: string[]
    venue?: string
    startsAt?: Date
    endsAt?: Date
}

export interface EventStatics {
    createEvent(
        {
            title,
            content,
            capacity,
            cover: { name, alt },
            venue,
            speakers,
            startsAt,
            endsAt,
        }: {
            title: string
            content: {
                md: string
                html: string
            }
            capacity: number
            cover: {
                name: string
                alt: string
            }
            speakers: string[]
            venue: string
            startsAt: Date
            endsAt: Date
        },
        select?: string
    ): Promise<IEvent>
    patchEvent(
        {
            id,
            title,
            content,
            capacity,
            cover: { name, alt },
            venue,
            speakers,
            startsAt,
            endsAt,
        }: PatchEventPayload,
        select?: string
    ): Promise<IEvent>
    deleteEvent({ _id }: { _id: string }, select?: string): Promise<IEvent>
}

export type EventModel = Model<IEvent> & EventStatics
