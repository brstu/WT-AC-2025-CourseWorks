import { IEvent } from './event.interface'
import { IUser } from './user.interface'

export type IInvitationUser = Pick<IUser, '_id' | 'name'>
export type IInvitationEvent = Pick<IEvent, '_id' | 'title' | 'cover'>

export interface IInvitation {
    _id: string
    event: IInvitationEvent
    user_invited: IInvitationUser
    invited_by: IInvitationUser
    createdAt: string
    updatedAt: string
}
