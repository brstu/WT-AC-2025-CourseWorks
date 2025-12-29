export interface IUser {
    _id: string
    name: string
    email: string
}

export interface IUserAdmin {
    _id: string
    name: string
    email: string
    role: 'user' | 'admin'
    createdAt: string
    updatedAt: string
}
