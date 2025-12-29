import { Schema, model, models } from 'mongoose'
import { IInvitation, InvitationModel } from '../types/invitation'
import { INVITATION_ERRORS } from '../constants/errors'
import { isBlankField } from '../utils/is-blank-field'

export const invitationSchema = new Schema<IInvitation, InvitationModel>(
    {
        user_invited: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        invited_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        event: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

invitationSchema.statics.createInvitation = async function (
    { user_invited, event, invited_by },
    select = ''
) {
    const fields: Record<string, any> = {
        user_invited,
        event,
        invited_by,
    }

    const missing = Object.entries(fields)
        .filter(([_, value]) => isBlankField(value))
        .map(([key]) => key)

    if (missing.length > 0) {
        throw new Error(`${INVITATION_ERRORS.MISSING_FIELDS}: ${missing.join(', ')}`)
    }

    const isAlreadyInvited = await this.findOne({ user_invited, invited_by, event })

    if (isAlreadyInvited) {
        throw new Error(INVITATION_ERRORS.ALREADY_INVITED)
    }

    if (user_invited === invited_by) {
        throw new Error(INVITATION_ERRORS.INVITE_YOURSELF)
    }

    const invitation = await this.create({ user_invited, event, invited_by })

    return invitation
}

invitationSchema.statics.deleteInvitation = async function ({ _id }, select = '') {
    if (!_id) {
        throw new Error(INVITATION_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id).select(`${select}`).lean()

    if (!deleted) {
        throw new Error(INVITATION_ERRORS.NOT_FOUND)
    }

    return deleted
}

export const Invitation =
    (models.Invitation as InvitationModel) ||
    model<IInvitation, InvitationModel>('Invitation', invitationSchema)
