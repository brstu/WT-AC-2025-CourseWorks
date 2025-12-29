import { Schema, model, models } from 'mongoose'
import { IUser, UserModel } from '../types/user'
import { comparePassword, hashPassword } from '../utils/hash'
import { USER_ERRORS } from '../constants/errors'

export const userSchema = new Schema<IUser, UserModel>(
    {
        name: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

// Client

userSchema.statics.signup = async function ({ email, password, name }, select = '') {
    if (!email || !password || !name) {
        throw new Error(USER_ERRORS.REQUIRED_FIELDS)
    }

    if (password.length < 6) {
        throw new Error(USER_ERRORS.PASSWORD_SHORT)
    }

    const isExist = await this.findOne({ email })

    if (isExist) {
        throw new Error(USER_ERRORS.ALREADY_EXISTS)
    }

    const hashedPassword = await hashPassword(password)

    const user = await this.create({ email, name, password: hashedPassword })

    return this.findById(user._id).select(`${select} -password -role -__v`).lean()
}

userSchema.statics.signin = async function ({ email, password }, select = '') {
    if (!email || !password) {
        throw new Error(USER_ERRORS.REQUIRED_FIELDS)
    }

    if (password.length < 6) {
        throw new Error(USER_ERRORS.PASSWORD_SHORT)
    }

    const user = await this.findOne({ email })

    if (!user) {
        throw new Error(USER_ERRORS.NOT_FOUND)
    }

    const match = await comparePassword(password, user.password)

    if (!match) {
        throw new Error(USER_ERRORS.PASSWORD_INCORRECT)
    }

    return this.findById(user._id).select(`${select} -password -role -__v`).lean()
}

userSchema.statics.getUser = async function ({ _id }, select = '') {
    if (!_id) {
        throw new Error(USER_ERRORS.ID_REQUIRED)
    }

    const user = await this.findById(_id)
        .select(`${select} -password -role -__v -createdAt -updatedAt`)
        .lean()

    if (!user) {
        throw new Error(USER_ERRORS.NOT_FOUND)
    }

    return user
}

// Admin

userSchema.statics.adminSignin = async function ({ email, password }, select = '') {
    const user = await this.signin({ email, password })
    const { role } = await this.findById(user._id).select('role')

    if (role !== 'admin') {
        throw new Error(USER_ERRORS.INVALID_ROLE)
    }

    return this.findById(user._id).select(`${select} -password -role -__v`).lean()
}

userSchema.statics.createUser = async function (
    { email, password, name = null, role = 'user' },
    select = ''
) {
    if (!email || !password) {
        throw new Error(USER_ERRORS.REQUIRED_FIELDS)
    }

    if (password.length < 6) {
        throw new Error(USER_ERRORS.PASSWORD_SHORT)
    }

    const isEmailExist = await this.findOne({ email })

    if (isEmailExist) {
        throw new Error(USER_ERRORS.ADMIN_EMAIL_EXIST)
    }

    const hashedPassword = await hashPassword(password)

    const user = await this.create({
        email,
        name,
        password: hashedPassword,
        role,
    })

    return this.findById(user._id).select(`${select} -password -__v`).lean()
}

userSchema.statics.patchUser = async function (
    { _id, email, name = null, role = 'user' },
    select = ''
) {
    if (!_id) {
        throw new Error(USER_ERRORS.ID_REQUIRED)
    }

    const current = await this.findById(_id).select('email role')
    if (!current) {
        throw new Error(USER_ERRORS.NOT_FOUND)
    }

    if (email !== current.email) {
        const emailExists = await this.exists({ email, _id: { $ne: _id } })
        if (emailExists) {
            throw new Error(USER_ERRORS.ADMIN_EMAIL_EXIST)
        }
    }

    if (role && !['user', 'admin'].includes(role)) {
        throw new Error(USER_ERRORS.INVALID_ROLE)
    }

    const update: Record<string, any> = { email, role }
    if (typeof name !== 'undefined') update.name = name

    const updated = await this.findByIdAndUpdate(_id, update, { new: true, runValidators: true })
        .select(`${select} -password -__v`)
        .lean()

    return updated
}

userSchema.statics.deleteUser = async function ({ _id }, select = '') {
    if (!_id) {
        throw new Error(USER_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id).select(`${select} -password -__v`).lean()
    if (!deleted) {
        throw new Error(USER_ERRORS.NOT_FOUND)
    }
    return deleted
}

userSchema.statics.resetPassword = async function ({ _id, password }, select = '') {
    if (!_id) {
        throw new Error(USER_ERRORS.ID_REQUIRED)
    }
    if (!password) {
        throw new Error(USER_ERRORS.PASSWORD_REQUIRED)
    }
    if (password.length < 6) {
        throw new Error(USER_ERRORS.PASSWORD_SHORT)
    }

    const current = await this.findById(_id).select('password')
    if (!current) {
        throw new Error(USER_ERRORS.NOT_FOUND)
    }

    const same = await comparePassword(password, current.password)
    if (same) {
        throw new Error(USER_ERRORS.PASSWORD_SAME_AS_OLD)
    }

    const hashed = await hashPassword(password)
    await this.updateOne({ _id }, { $set: { password: hashed } })

    return this.findById(_id).select(`${select} -password -__v`).lean()
}

export const User = (models.User as UserModel) || model<IUser, UserModel>('User', userSchema)
