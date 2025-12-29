import { Schema, model, models } from 'mongoose'
import { ITicket, TicketModel } from '../types/ticket'
import { TICKET_ERRORS } from '../constants/errors'

import { ETicketStatus } from '../constants/ticket-status'

import { isBlankField } from '../utils/is-blank-field'

export const ticketSchema = new Schema<ITicket, TicketModel>(
    {
        atendee_id: {
            type: Schema.Types.ObjectId,
            ref: 'Atendee',
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        code: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

ticketSchema.statics.createTicket = async function ({ atendee_id, user_id, event, code }) {
    const fields: Record<string, any> = {
        atendee_id,
        user_id,
        event,
        code,
    }

    const missing = Object.entries(fields)
        .filter(([_, value]) => isBlankField(value))
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`${TICKET_ERRORS.MISSING_FIELDS}: ${missing.join(', ')}`)
    }

    const codeStr = String(code)

    const CODE_REGEXP = /^\d{8}$/
    if (!CODE_REGEXP.test(codeStr)) {
        throw new Error(TICKET_ERRORS.INVALID_CODE)
    }

    const ticket = await this.create({ atendee_id, user_id, event, code })

    return ticket
}

ticketSchema.statics.unregisterAtendeeFromEvent = async function ({ atendee_id }) {
    if (!atendee_id) {
        throw new Error(TICKET_ERRORS.ATENDEE_ID_REQUIRED)
    }

    const deleted = await this.findOneAndDelete({ atendee_id })

    if (!deleted) {
        throw new Error(TICKET_ERRORS.NOT_FOUND)
    }

    return deleted
}

export const Ticket =
    (models.Ticket as TicketModel) || model<ITicket, TicketModel>('Ticket', ticketSchema)
