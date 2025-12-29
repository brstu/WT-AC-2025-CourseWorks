import { NextFunction, Response } from 'express'
import { AuthRequest } from '../types/auth-request'
import jwt from 'jsonwebtoken'

import { HTTP_STATUS } from '../constants/http-status'
import { AUTH_ERRORS } from '../constants/errors'
import { RESPONSE_STATUS } from '../constants/response-status'

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // verify auth
    const token = req.cookies?.jwt

    if (!token) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.UNAUTHORIZED,
            message: AUTH_ERRORS.TOKEN_REQUIRED,
        })
    }

    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = _id

        next()
    } catch (error) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.UNAUTHORIZED,
            message: AUTH_ERRORS.TOKEN_INVALID,
        })
    }
}
