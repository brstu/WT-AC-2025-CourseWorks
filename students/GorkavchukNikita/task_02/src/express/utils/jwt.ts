import jwt from 'jsonwebtoken'
import { IJWT } from '../types/jwt'
import { JWT_ERRORS } from '../constants/errors'

export const createToken = ({ _id }: IJWT) => {
    const JWT_SECRET = process.env.JWT_SECRET as string
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

    if (!JWT_SECRET) {
        throw new Error(JWT_ERRORS.SECRET_NOT_DEFINED)
    }

    if (!JWT_EXPIRES_IN) {
        throw new Error(JWT_ERRORS.EXPIRES_NOT_DEFINED)
    }

    return jwt.sign({ _id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}
