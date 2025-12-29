import { Model } from 'mongoose'

export interface ISpeaker {
    _id: string
    name: string
    bio: string
    contacts: {
        telegram?: string
        phone?: string
        email?: string
    }
    photo: {
        name?: string
        alt?: string
    }
}

export type PatchSpeakerPayload = {
    _id: string
    name?: string
    bio?: string
    contacts?: {
        telegram?: string
        phone?: string
        email?: string
    }
    photo?: {
        name?: string
        alt?: string
    }
}

export interface SpeakerStatics {
    createSpeaker(
        {
            name,
            bio,
            contacts,
            photo,
        }: {
            name: string
            bio: string
            contacts: {
                telegram?: string
                phone?: string
                email?: string
            }
            photo: {
                name?: string
                alt?: string
            }
        },
        select?: string
    ): Promise<ISpeaker>
    patchSpeaker(
        {
            _id,
            name,
            bio,
            contacts,
            photo,
        }: {
            _id: string
            name?: string
            bio?: string
            contacts?: {
                telegram?: string
                phone?: string
                email?: string
            }
            photo?: {
                name?: string
                alt?: string
            }
        },
        select?: string
    ): Promise<ISpeaker>
    deleteSpeaker(
        {
            _id,
        }: {
            _id: string
        },
        select?: string
    ): Promise<ISpeaker>
}

export type SpeakerModel = Model<ISpeaker> & SpeakerStatics
