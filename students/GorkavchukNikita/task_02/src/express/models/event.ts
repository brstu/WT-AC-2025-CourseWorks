import { Schema, Types, model, models } from 'mongoose'
import { IEvent, EventModel } from '../types/event'
import { EVENT_ERRORS } from '../constants/errors'
import { generateOrderCode } from '../utils/generateOrderCode'

export const eventSchema = new Schema<IEvent, EventModel>(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        status: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
)

eventSchema.statics.createEvent = async function (props) {
    const { orderId, location, status, description = '' } = props
    const requiresProps = { orderId, location, status }

    for (const [key, value] of Object.entries(requiresProps)) {
        if (value === undefined || value === null || value === '') {
            throw new Error(`${EVENT_ERRORS.REQUIRED_FIELDS}: ${key}`)
        }
    }

    const event = await this.create({ orderId, location, status, description })

    return event
}

eventSchema.statics.patchEvent = async function (props) {
    const { _id, orderId, ...rest } = props

    if (!_id) {
        throw new Error(EVENT_ERRORS.ID_REQUIRED)
    }

    const event = await this.findById(_id)

    if (!event) {
        throw new Error(EVENT_ERRORS.NOT_FOUND)
    }

    const update: Record<string, any> = {}

    for (const [key, value] of Object.entries({ ...rest })) {
        if (value !== undefined) {
            update[key] = value
        }
    }

    const updated = await this.findByIdAndUpdate(
        _id,
        { $set: update },
        {
            new: true,
            runValidators: true,
            context: 'query',
        }
    )

    if (!updated) {
        throw new Error(EVENT_ERRORS.NOT_FOUND)
    }

    return updated
}

eventSchema.statics.deleteEvent = async function ({ _id }) {
    if (!_id) {
        throw new Error(EVENT_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id)
    if (!deleted) {
        throw new Error(EVENT_ERRORS.NOT_FOUND)
    }
    return deleted
}

export const Event = (models.Event as EventModel) || model<IEvent, EventModel>('Event', eventSchema)
