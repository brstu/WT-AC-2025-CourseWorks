import { Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { Location } from '../../models/location'

import { COMMON_ERRORS, LOCATION_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const createLocation = async (req: AdminRequest, res: Response): Promise<void> => {
    const { type, label, locationCode, cityId, postalCode, street } = req.body

    try {
        const location = await Location.createLocation({
            type,
            label,
            locationCode,
            cityId,
            postalCode,
            street,
        })
        await location.populate({
            path: 'cityId',
            select: '-_id -__v',
            populate: {
                path: 'countryId',
                select: '-_id -__v',
            },
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            location,
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

export const getLocation = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const location = await Location.findById(id).populate({
            path: 'cityId',
            select: '-_id -__v',
            populate: {
                path: 'countryId',
                select: '-_id -__v',
            },
        })

        if (!location) {
            throw new Error(LOCATION_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            location,
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

export const getAllLocations = async (req: AdminRequest, res: Response) => {
    const { page: reqPage, limit: reqLimit } = req.query

    try {
        const page = Math.max(1, parseInt((reqPage as string) || '1', 10))
        const limit = Math.min(100, parseInt((reqLimit as string) || '20', 10))
        const skip = (page - 1) * limit
        const sort = (req.query.sort as string) || '-createdAt'
        const search = (req.query.search as string) || ''

        const filter: any = {}
        if (search) {
            filter.$or = [
                { label: { $regex: search, $options: 'i' } },
                { locationCode: { $regex: search, $options: 'i' } },
                { postalCode: { $regex: search, $options: 'i' } },
                { street: { $regex: search, $options: 'i' } },
            ]
        }

        const [total, countries] = await Promise.all([
            Location.countDocuments(filter),
            Location.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'cityId',
                    select: '-_id -__v',
                    populate: {
                        path: 'countryId',
                        select: '-_id -__v',
                    },
                })
                .lean({ virtuals: true }),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: countries,
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

export const patchLocation = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id, type, label, locationCode, cityId, postalCode, street } = req.body

    try {
        const location = await Location.patchLocation({
            _id: id,
            type,
            label,
            locationCode,
            cityId,
            postalCode,
            street,
        })
        await location.populate({
            path: 'cityId',
            populate: {
                path: 'countryId',
            },
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            location,
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

export const deleteLocation = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const location = await Location.deleteLocation({ _id: id })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            location,
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
