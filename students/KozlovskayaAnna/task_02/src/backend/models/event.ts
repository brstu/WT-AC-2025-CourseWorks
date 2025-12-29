import { Schema, model, models } from 'mongoose'
import { IEvent, EventModel } from '../types/event'
import { isBlankField } from '../utils/is-blank-field'
import { EVENTS_ERRORS } from '../constants/errors'

const ContentSchema = new Schema(
    {
        md: {
            type: String,
            default: '',
        },
        html: {
            type: String,
            default: '',
        },
    },
    { _id: false }
)

const CoverSchema = new Schema(
    {
        name: {
            type: String,
            default: '',
            trim: true,
        },
        alt: {
            type: String,
            default: '',
            trim: true,
        },
    },
    { _id: false }
)

export const eventSchema = new Schema<IEvent, EventModel>(
    {
        title: {
            type: String,
            required: true,
        },
        cover: {
            type: CoverSchema,
            default: {},
        },
        content: {
            type: ContentSchema,
            default: {},
        },
        capacity: {
            type: Number,
            default: 100,
        },
        venue: {
            type: String,
            default: '',
        },
        speakers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Speaker',
            },
        ],
        startsAt: {
            type: Date,
            required: true,
        },
        endsAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

// Admin

eventSchema.statics.createEvent = async function ({
    title,
    cover,
    capacity,
    content,
    venue,
    speakers,
    startsAt,
    endsAt,
}) {
    const fields: Record<string, any> = {
        title,
        'cover.name': cover?.name,
        'content.md': content?.md,
        'content.html': content?.html,
        venue,
        capacity,
        speakers,
        startsAt,
        endsAt,
    }

    const missing = Object.entries(fields)
        .filter(([_, value]) => isBlankField(value))
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`${EVENTS_ERRORS.MISSING_FIELDS}: ${missing.join(', ')}`)
    }

    const start = new Date(startsAt)
    const end = new Date(endsAt)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error(EVENTS_ERRORS.INVALID_DATES)
    }

    if (end <= start) {
        throw new Error(EVENTS_ERRORS.ENDS_AFTER_START)
    }

    if (isNaN(Number(capacity)) || capacity <= 0) {
        throw new Error(EVENTS_ERRORS.INVALID_CAPACITY)
    }

    const event = await this.create({
        title,
        cover,
        content,
        capacity,
        venue,
        speakers,
        startsAt: start,
        endsAt: end,
    })

    return event
}

eventSchema.statics.patchEvent = async function ({
    id,
    title,
    cover,
    capacity,
    content,
    venue,
    speakers,
    startsAt,
    endsAt,
}) {
    const event = await this.findById(id)

    if (!event) {
        throw new Error(EVENTS_ERRORS.NOT_FOUND)
    }

    const update: Record<string, any> = {}

    if (typeof title !== 'undefined') {
        update.title = title
    }

    if (typeof venue !== 'undefined') {
        update.venue = venue
    }

    if (typeof cover !== 'undefined') {
        if (typeof cover.name !== 'undefined') {
            update['cover.name'] = cover.name
        }
        if (typeof cover.alt !== 'undefined') {
            update['cover.alt'] = cover.alt
        }
    }

    if (typeof content !== 'undefined') {
        update['content.md'] = content.md
        update['content.html'] = content.html
    }

    if (typeof capacity !== 'undefined') {
        if (isNaN(Number(capacity)) || capacity <= 0) {
            throw new Error(EVENTS_ERRORS.INVALID_CAPACITY)
        }
        update.capacity = capacity
    }

    if (typeof speakers !== 'undefined') {
        update.speakers = speakers
    }

    if (typeof startsAt !== 'undefined' || typeof endsAt !== 'undefined') {
        const start = typeof startsAt !== 'undefined' ? new Date(startsAt) : event.startsAt
        const end = typeof endsAt !== 'undefined' ? new Date(endsAt) : event.endsAt

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            throw new Error(EVENTS_ERRORS.INVALID_DATES)
        }

        if (end <= start) {
            throw new Error(EVENTS_ERRORS.ENDS_AFTER_START)
        }

        update.startsAt = start
        update.endsAt = end
    }

    if (Object.keys(update).length === 0) {
        return event
    }

    const updatedEvent = await this.findByIdAndUpdate(id, { $set: update }, { new: true })

    return updatedEvent
}

eventSchema.statics.deleteEvent = async function ({ _id }, select = '') {
    if (!_id) {
        throw new Error(EVENTS_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id).select(`${select}`).lean()

    if (!deleted) {
        throw new Error(EVENTS_ERRORS.NOT_FOUND)
    }

    return deleted
}

export const Event = (models.Event as EventModel) || model<IEvent, EventModel>('Event', eventSchema)
