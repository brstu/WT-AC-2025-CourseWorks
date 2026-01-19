export type TOrderStatus = 0 | 1 | 2 | 3 | 5
export type TEventStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ICountryLite {
    name: string
    countryCode: string
}

export interface ICityLite {
    name: string
    cityCode: string
    countryId?: ICountryLite
}

export interface ILocationLite {
    // в некоторых populate на бэке _id выключен через select: '-_id'
    _id?: string
    type: number
    label: string
    locationCode: string
    cityId?: ICityLite
    postalCode?: string
    street?: string
}

export interface IOrderAdmin {
    _id: string
    name: string
    userId: string
    orderCode: string
    status: number
    pickupLocation: ILocationLite
    currentLocation: ILocationLite
    createdAt: string
    updatedAt: string
}

export interface IOrderEventAdmin {
    _id: string
    orderId: string
    location: ILocationLite
    status: number
    description?: string
    createdAt: string
    updatedAt: string
}
