import { ISpeaker } from './speaker.interface'

export type IEventSpeaker = Pick<ISpeaker, '_id' | 'name' | 'bio' | 'photo' | 'contacts'>

export interface IEvent {
    _id: string
    title: string
    cover: {
        name: string
        alt: string
    }
    content: {
        html: string
    }
    capacity: number
    atendeeCount: number
    venue: string
    speakers: IEventSpeaker[]
    startsAt: string
    endsAt: string
}

export interface IEventAdmin extends IEvent {
    content: {
        html: string
        md: string
    }
    createdAt: string
    updatedAt: string
}
