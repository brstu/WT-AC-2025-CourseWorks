import { Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { Country } from '../../models/country'

import { COMMON_ERRORS, COUNTRY_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const createCountry = async (req: AdminRequest, res: Response): Promise<void> => {
    const { name, countryCode } = req.body

    try {
        const country = await Country.createCountry({ name, countryCode })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            country,
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

export const getCountry = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const country = await Country.findById(id)

        if (!country) {
            throw new Error(COUNTRY_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            country,
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

export const getAllCountries = async (req: AdminRequest, res: Response) => {
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
                { countryCode: { $regex: search, $options: 'i' } },
            ]
        }

        const [total, countries] = await Promise.all([
            Country.countDocuments(filter),
            Country.find(filter).sort(sort).skip(skip).limit(limit).lean(),
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

export const patchCountry = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, countryCode } = req.body

    try {
        const country = await Country.patchCountry({ _id: id, name, countryCode })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            country,
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

export const deleteCountry = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const country = await Country.deleteCountry({ _id: id })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            country,
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
