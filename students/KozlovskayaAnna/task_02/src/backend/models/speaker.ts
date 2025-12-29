import { Schema, model, models } from 'mongoose'
import { ISpeaker, SpeakerModel } from '../types/speaker'
import { SPEAKERS_ERRORS } from '../constants/errors'

const ContactsSchema = new Schema(
    {
        telegram: {
            type: String,
            default: '',
            trim: true,
        },
        phone: {
            type: String,
            default: '',
            trim: true,
        },
        email: {
            type: String,
            default: '',
            trim: true,
            lowercase: true,
        },
    },
    { _id: false }
)

const PhotoSchema = new Schema(
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

export const speakerSchema = new Schema<ISpeaker, SpeakerModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            required: true,
            trim: true,
        },
        contacts: {
            type: ContactsSchema,
            default: {},
        },
        photo: {
            type: PhotoSchema,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

// Admin

speakerSchema.statics.createSpeaker = async function ({ name, bio, contacts, photo }, select = '') {
    if (!name?.trim()) {
        throw new Error(SPEAKERS_ERRORS.NAME_REQUIRED)
    }

    if (!bio?.trim()) {
        throw new Error(SPEAKERS_ERRORS.BIO_REQUIRED)
    }

    let normalizedContacts = undefined

    if (contacts) {
        normalizedContacts = {
            telegram: contacts?.telegram?.trim() || '',
            phone: contacts?.phone?.trim() || '',
            email: contacts?.email?.trim() || '',
        }
    }

    let normalizedPhoto = undefined

    if (photo) {
        normalizedPhoto = {
            name: photo?.name?.trim() || '',
            alt: photo?.alt?.trim() || '',
        }
    }

    const data = {
        name,
        bio,
        contacts: normalizedContacts,
        photo: normalizedPhoto,
    }

    const speaker = await this.create(data)

    return this.findById(speaker._id).select(`${select}`).lean()
}

speakerSchema.statics.patchSpeaker = async function (
    { _id, name, bio, contacts, photo },
    select = ''
) {
    if (!_id) throw new Error(SPEAKERS_ERRORS.ID_REQUIRED)

    if (name !== undefined && !name.trim()) {
        throw new Error(SPEAKERS_ERRORS.NAME_REQUIRED)
    }
    if (bio !== undefined && !bio.trim()) {
        throw new Error(SPEAKERS_ERRORS.BIO_REQUIRED)
    }

    const $set: Record<string, any> = {}
    const $unset: Record<string, ''> = {}

    if (name !== undefined) {
        $set['name'] = name.trim()
    }
    if (bio !== undefined) {
        $set['bio'] = bio.trim()
    }

    if (contacts !== undefined) {
        if ('telegram' in contacts) {
            if (contacts.telegram === null) $unset['contacts.telegram'] = ''
            else $set['contacts.telegram'] = (contacts.telegram ?? '').trim()
        }
        if ('phone' in contacts) {
            if (contacts.phone === null) $unset['contacts.phone'] = ''
            else $set['contacts.phone'] = (contacts.phone ?? '').trim()
        }
        if ('email' in contacts) {
            if (contacts.email === null) $unset['contacts.email'] = ''
            else $set['contacts.email'] = (contacts.email ?? '').trim().toLowerCase()
        }
    }

    if (photo !== undefined) {
        if ('name' in photo) {
            if (photo.name === null) $unset['photo.name'] = ''
            else $set['photo.name'] = (photo.name ?? '').trim()
        }
        if ('alt' in photo) {
            if (photo.alt === null) $unset['photo.alt'] = ''
            else $set['photo.alt'] = (photo.alt ?? '').trim()
        }
    }

    if (!Object.keys($set).length && !Object.keys($unset).length) {
        throw new Error(SPEAKERS_ERRORS.NO_FIELDS_TO_UPDATE)
    }

    const update: any = {}

    if (Object.keys($set).length) {
        update.$set = $set
    }
    if (Object.keys($unset).length) {
        update.$unset = $unset
    }

    const updated = await this.findByIdAndUpdate(_id, update, {
        new: true,
        runValidators: true,
        context: 'query',
    })
        .select(select)
        .lean()

    if (!updated) {
        throw new Error(SPEAKERS_ERRORS.NOT_FOUND)
    }

    return updated
}

speakerSchema.statics.deleteSpeaker = async function ({ _id }, select = '') {
    if (!_id) {
        throw new Error(SPEAKERS_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id).select(`${select}`).lean()

    if (!deleted) {
        throw new Error(SPEAKERS_ERRORS.NOT_FOUND)
    }

    return deleted
}

export const Speaker =
    (models.Speaker as SpeakerModel) || model<ISpeaker, SpeakerModel>('Speaker', speakerSchema)
