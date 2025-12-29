import { Response } from 'express'
import { AuthRequest } from '../../types/auth-request'
import { Invitation } from '../../models/invitation'

import { COMMON_ERRORS, USER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const getInvitations = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId

    try {
        const invitations = await Invitation.find({ user_invited: userId })
            .populate([
                {
                    path: 'invited_by',
                    select: 'name',
                },
                {
                    path: 'user_invited',
                    select: 'name',
                },
                {
                    path: 'event',
                    select: 'title cover',
                },
            ])
            .lean()

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { invitations },
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}
