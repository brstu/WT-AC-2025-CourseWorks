import { HydratedDocument, Model, Types } from 'mongoose'

export interface IEvent {
    _id: string
    orderId: Types.ObjectId
    location: Types.ObjectId
    status: number
    description?: string
}

export type EventDoc = HydratedDocument<IEvent>

export interface EventStatics {
    createEvent(
        {
            orderId,
            location,
            status,
            description,
        }: {
            orderId: string
            location: string
            status: number
            description?: string
        },
        select?: string
    ): Promise<EventDoc>
    patchEvent(
        {
            _id,
            orderId,
            location,
            status,
            description,
        }: {
            _id: string
            orderId: string
            location: string
            status: number
            description?: string
        },
        select?: string
    ): Promise<EventDoc>
    deleteEvent(
        {
            _id,
        }: {
            _id: string
        },
        select?: string
    ): Promise<EventDoc>
}

export type EventModel = Model<IEvent> & EventStatics
