import { Schema, model, models } from 'mongoose'
import { IAtendee, AtendeeModel } from '../types/atendee'
import { ATENDEE_ERRORS } from '../constants/errors'
import { isBlankField } from '../utils/is-blank-field'

export const atendeeSchema = new Schema<IAtendee, AtendeeModel>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        event_id: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

atendeeSchema.statics.registerToEvent = async function ({ event_id, user_id }, select = '') {
    const fields: Record<string, any> = {
        event_id,
        user_id,
    }

    const missing = Object.entries(fields)
        .filter(([_, value]) => isBlankField(value))
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`${ATENDEE_ERRORS.MISSING_FIELDS}: ${missing.join(', ')}`)
    }

    const isAlreadyRegister = await this.findOne({ user_id, event_id })

    if (isAlreadyRegister) {
        throw new Error(ATENDEE_ERRORS.ALREADY_REGISTERED)
    }

    const atendee = await this.create({ event_id, user_id })

    return atendee
}

atendeeSchema.statics.unregisterFromEvent = async function ({ event_id, user_id }, select = '') {
    const fields: Record<string, any> = {
        event_id,
        user_id,
    }

    const missing = Object.entries(fields)
        .filter(([_, value]) => isBlankField(value))
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`${ATENDEE_ERRORS.MISSING_FIELDS}: ${missing.join(', ')}`)
    }

    const deleted = await this.findOneAndDelete({ event_id, user_id }).select(select).lean()

    if (!deleted) {
        throw new Error(ATENDEE_ERRORS.NOT_REGISTERED)
    }

    return deleted
}

export const Atendee =
    (models.Atendee as AtendeeModel) || model<IAtendee, AtendeeModel>('Atendee', atendeeSchema)
