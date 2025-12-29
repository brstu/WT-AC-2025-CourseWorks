import { Request, Response } from 'express'
import { AuthRequest } from '../../types/auth-request'
import { User } from '../../models/user'
import { createToken } from '../../utils/jwt'

import { COMMON_ERRORS, USER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

const isProd = process.env.NODE_ENV === 'production'

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body

    try {
        const user = await User.signup({ email, password, name })
        const { _id } = user

        const token = createToken({ _id })

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
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

export const signin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body

    try {
        const user = await User.signin({ email, password })
        const { _id } = user

        const token = createToken({ _id })

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
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

export const logout = (req: Request, res: Response): void => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { loggedOut: true },
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

export const profile = async (req: AuthRequest, res: Response) => {
    const userId = req.userId
    try {
        if (!userId) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        const user = await User.getUser({ _id: userId })

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

export const role = async (req: AuthRequest, res: Response) => {
    const userId = req.userId
    try {
        if (!userId) {
            throw new Error(USER_ERRORS.ID_REQUIRED)
        }

        const { role } = await User.findById(userId).select('role')

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { role },
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
