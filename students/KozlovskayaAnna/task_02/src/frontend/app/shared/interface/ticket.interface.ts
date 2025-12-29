import { IEvent } from './event.interface'
import { IUser } from './user.interface'

export type ITicketUser = Pick<IUser, '_id' | 'name' | 'email'>
export type ITicketEvent = Pick<IEvent, '_id' | 'title' | 'venue' | 'startsAt'>

export interface ITicket {
    _id: string
    atendee_id: string
    user_id: ITicketUser
    event: ITicketEvent
    code: number
}
