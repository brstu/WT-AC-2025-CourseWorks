import { Model } from 'mongoose'

export interface IUser {
    _id: string
    name?: string | null
    email: string
    password: string
    role: 'user' | 'admin'
}

export interface UserStatics {
    signup(
        {
            email,
            password,
            name,
        }: {
            email: string
            password: string
            name: string
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
            name,
            password,
            role,
        }: {
            email: string
            password: string
            name?: string
            role?: string
        },
        select?: string
    ): Promise<IUser>
    patchUser(
        {
            _id,
            email,
            name,
            role,
        }: {
            _id: string
            email: string
            name?: string
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
