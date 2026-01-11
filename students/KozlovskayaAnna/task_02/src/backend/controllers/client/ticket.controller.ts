import { Response } from 'express'
import { AuthRequest } from '../../types/auth-request'

import { Ticket } from '../../models/ticket'

import { COMMON_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const getTickets = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId

    try {
        const tickets = await Ticket.find({ user_id: userId }).populate([
            {
                path: 'event',
                select: 'startsAt venue title',
            },
            {
                path: 'user_id',
                select: 'name email',
            },
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { tickets },
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

export const getTicket = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const ticket = await Ticket.findById(id as string)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { ticket },
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
