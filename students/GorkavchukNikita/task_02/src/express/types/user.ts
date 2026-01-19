import { Model } from 'mongoose'

export interface IUser {
    _id: string
    firstname?: string | null
    lastname?: string | null
    email: string
    password: string
    phone?: string | null
    role: 'user' | 'admin'
}

export interface UserStatics {
    signup(
        {
            email,
            password,
            firstname,
        }: {
            email: string
            password: string
            firstname: string
        },
        select?: string
    ): Promise<IUser>
    signin(
        { email, password }: { email: string; password: string },
        select?: string
    ): Promise<IUser>
    adminSignin(
        { email, password }: { email: string; password: string },
        select?: string
    ): Promise<IUser>
    getUser({ _id }: { _id: string }, select?: string): Promise<IUser>
    createUser(
        {
            email,
            firstname,
            password,
            lastname,
            phone,
            role,
        }: {
            email: string
            password: string
            firstname?: string
            lastname?: string
            phone?: string
            role?: string
        },
        select?: string
    ): Promise<IUser>
    patchUser(
        {
            _id,
            email,
            firstname,
            lastname,
            phone,
            role,
        }: {
            _id: string
            email: string
            firstname?: string
            lastname?: string
            phone?: string
            role?: string
        },
        select?: string
    )
    deleteUser(
        {
            _id,
        }: {
            _id: string
        },
        select?: string
    ): Promise<IUser>
    resetPassword(
        {
            _id,
            password,
        }: {
            _id: string
            password: string
        },
        select?: string
    ): Promise<IUser>
}

export type UserModel = Model<IUser> & UserStatics
