export interface IUser {
    _id: string
    firstname?: string | null
    lastname?: string | null
    email: string
    phone?: string | null
    createdAt: string
    updatedAt: string
}

export interface IUserAdmin {
    _id: string
    firstname?: string | null
    lastname?: string | null
    email: string
    password: string
    phone?: string | null
    role: 'user' | 'admin'
    createdAt: string
    updatedAt: string
}
