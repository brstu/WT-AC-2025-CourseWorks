import { Request, Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { User } from '../../models/user'
import { createToken } from '../../utils/jwt'

import { COMMON_ERRORS, USER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

export const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    try {
        const user = await User.adminSignin({ email, password })
        const { _id } = user

        const token = createToken({ _id })

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(HTTP_STATUS.OK)
            .json({
                status: RESPONSE_STATUS.OK,
                code: HTTP_STATUS.OK,
                data: { user },
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

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
        const limit = Math.min(100, parseInt((req.query.limit as string) || '20', 10))
        const skip = (page - 1) * limit
        const sort = (req.query.sort as string) || '-createdAt'
        const search = (req.query.search as string) || ''

        const filter: any = {}
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ]
        }

        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).select('-password -__v').sort(sort).skip(skip).limit(limit).lean(),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                users,
            },
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

export const createUser = async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body

    try {
        const user = await User.createUser({ email, password, name, role })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { user },
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

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        if (!id) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        const user = await User.findById(id as string).select('-password -__v').lean()

        if (!user) {
            throw new Error(USER_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { user },
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

export const patchUser = async (req: AdminRequest, res: Response) => {
    const { id } = req.params
    const userId = req.userId
    const { email, name, role } = req.body

    try {
        if (!id) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        if (id === userId) {
            throw new Error(USER_ERRORS.ADMIN_SAME_ID)
        }

        const user = await User.patchUser({ _id: id as string, email, name, role })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { user },
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

export const deleteUser = async (req: AdminRequest, res: Response) => {
    const { id } = req.params
    const userId = req.userId

    try {
        if (!id) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        if (id === userId) {
            throw new Error(USER_ERRORS.ADMIN_SAME_ID)
        }

        const user = await User.deleteUser({ _id: id as string })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { user },
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

export const resetUserPassword = async (req: AdminRequest, res: Response) => {
    const { id } = req.params
    const { password } = req.body
    const userId = req.userId

    try {
        if (!id) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        if (id === userId) {
            throw new Error(USER_ERRORS.ADMIN_SAME_ID)
        }

        const user = await User.resetPassword({ _id: id as string, password })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { user },
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
