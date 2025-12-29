import { Model, Types } from 'mongoose'
import { ETicketStatus } from '../constants/ticket-status'

export interface ITicket {
    atendee_id: Types.ObjectId
    user_id: Types.ObjectId
    event: Types.ObjectId
    code: number
}

export interface TicketStatics {
    createTicket({
        atendee_id,
        user_id,
        event,
        code,
    }: {
        atendee_id: string
        user_id: string
        event: string
        code: number
    }): Promise<ITicket>
    unregisterAtendeeFromEvent({ atendee_id }: { atendee_id: string }): Promise<ITicket>
}

export type TicketModel = Model<ITicket> & TicketStatics
