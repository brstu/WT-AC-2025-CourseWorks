import { Response } from 'express'
import { AuthRequest } from '../../types/auth-request'
import { Order } from '../../models/order'

import { COMMON_ERRORS, USER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    const { page: reqPage, limit: reqLimit } = req.query

    try {
        const userId = req.userId
        if (!userId) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        const pageParsed = parseInt((reqPage as string) || '1', 10)
        const limitParsed = parseInt((reqLimit as string) || '20', 10)

        const page = Number.isNaN(pageParsed) ? 1 : Math.max(1, pageParsed)
        const limit = Number.isNaN(limitParsed) ? 20 : Math.min(100, limitParsed)
        const skip = (page - 1) * limit

        const sort = (req.query.sort as string) || '-createdAt'
        const search = (req.query.search as string) || ''

        const filter: any = { userId }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { orderCode: { $regex: search, $options: 'i' } },
            ]
        }

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: { path: 'countryId', select: '-_id -__v' },
            },
        }

        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate([
                    { path: 'pickupLocation', ...locationPopulate },
                    { path: 'currentLocation', ...locationPopulate },
                ])
                .lean({ virtuals: true }),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: orders,
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
