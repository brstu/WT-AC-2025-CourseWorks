import { NextFunction, Response } from 'express'
import { AdminRequest } from '../types/admin-request'
import { User } from '../models/user'

import { HTTP_STATUS } from '../constants/http-status'
import { USER_ERRORS, COMMON_ERRORS } from '../constants/errors'
import { RESPONSE_STATUS } from '../constants/response-status'

export const checkAdmin = async (req: AdminRequest, res: Response, next: NextFunction) => {
    const userId = req?.userId

    if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.UNAUTHORIZED,
            message: USER_ERRORS.ID_REQUIRED,
        })
    }

    try {
        // verify user role
        const { role } = await User.findById(userId).select('role')

        if (role !== 'admin') {
            throw new Error(USER_ERRORS.INVALID_ROLE)
        }

        req.role = role

        next()
    } catch (error) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
            status: RESPONSE_STATUS.ERROR,
            message: COMMON_ERRORS.ROUTE_NOT_FOUND,
            code: HTTP_STATUS.NOT_FOUND,
        })
    }
}
