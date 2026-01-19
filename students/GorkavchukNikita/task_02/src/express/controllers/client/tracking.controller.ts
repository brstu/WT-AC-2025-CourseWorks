import { Response } from 'express'
import { Request } from 'express'
import { Order } from '../../models/order'
import { Event } from '../../models/event'

import { COMMON_ERRORS, ORDER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const getTrackingByCode = async (req: Request, res: Response): Promise<void> => {
    const codeRaw = (req.params.code || '') as string
    const code = codeRaw.trim()

    try {
        if (!code) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        const order = await Order.findOne({ orderCode: code }).populate([
            { path: 'pickupLocation', ...locationPopulate },
            { path: 'currentLocation', ...locationPopulate },
        ])

        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const events = await Event.find({ orderId: order._id })
            .sort({ createdAt: 1 })
            .populate({ path: 'location', ...locationPopulate })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order,
            events,
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
