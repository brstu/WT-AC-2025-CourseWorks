import { Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { City } from '../../models/city'

import { CITY_ERRORS, COMMON_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const createCity = async (req: AdminRequest, res: Response): Promise<void> => {
    const { name, cityCode, countryId } = req.body

    try {
        const city = await City.createCity({ name, cityCode, countryId })
        await city.populate('countryId')

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            city,
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

export const getCity = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const city = await City.findById(id).populate('countryId')

        if (!city) {
            throw new Error(CITY_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            city,
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

export const getAllCities = async (req: AdminRequest, res: Response) => {
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
                { name: { $regex: search, $options: 'i' } },
                { cityCode: { $regex: search, $options: 'i' } },
            ]
        }

        const [total, cities] = await Promise.all([
            City.countDocuments(filter),
            City.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: cities,
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

export const patchCity = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, cityCode, countryId } = req.body

    try {
        const city = await City.patchCity({ _id: id, name, cityCode, countryId })
        await city.populate('countryId')

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            city,
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

export const deleteCity = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const city = await City.deleteCity({ _id: id })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            city,
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
