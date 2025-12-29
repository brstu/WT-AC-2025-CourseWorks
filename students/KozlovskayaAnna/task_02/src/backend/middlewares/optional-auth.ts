import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../types/auth-request'

const JWT_SECRET = process.env.JWT_SECRET

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.jwt

        if (!token) {
            return next()
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { _id: string }

        req.userId = decoded._id
        next()
    } catch (e) {
        return next()
    }
}
