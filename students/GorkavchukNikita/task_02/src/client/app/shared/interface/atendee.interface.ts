import { IUser } from './user.interface'
import { IEvent } from './event.interface'

export interface IAtendee {
    _id: string
    user_id: IUser
    event_id: IEvent
    createdAt: string
    updatedAt: string
}
