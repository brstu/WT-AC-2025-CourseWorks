import { Model, Types } from 'mongoose'

export interface IAtendee {
    _id: Types.ObjectId
    user_id: Types.ObjectId
    event_id: Types.ObjectId
}

export interface AtendeeStatics {
    registerToEvent(
        {
            user_id,
            event_id,
        }: {
            user_id: string
            event_id: string
        },
        select?: string
    ): Promise<IAtendee>
    unregisterFromEvent(
        {
            user_id,
            event_id,
        }: {
            user_id: string
            event_id: string
        },
        select?: string
    ): Promise<IAtendee>
}

export type AtendeeModel = Model<IAtendee> & AtendeeStatics
