export interface ISpeaker {
    _id: string
    name: string
    bio: string
    contacts: {
        telegram: string
        phone: string
        email: string
    }
    photo: {
        name: string
        alt: string
    }
    createdAt: string
    updatedAt: string
}
