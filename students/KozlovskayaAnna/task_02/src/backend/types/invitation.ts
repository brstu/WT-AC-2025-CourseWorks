import { Model, Types } from 'mongoose'

export interface IInvitation {
    _id: Types.ObjectId
    user_invited: Types.ObjectId
    invited_by: Types.ObjectId
    event: Types.ObjectId
}

export interface InvitationStatics {
    createInvitation(
        {
            user_invited,
            invited_by,
            event,
        }: {
            user_invited: string
            invited_by: string
            event: string
        },
        select?: string
    ): Promise<IInvitation>
    deleteInvitation(
        {
            _id,
        }: {
            _id: string
        },
        select?: string
    ): Promise<IInvitation>
}

export type InvitationModel = Model<IInvitation> & InvitationStatics
