export type ILocationType = 0 | 1 | 2 | 3 | 4

export interface ILocationCountryLite {
    _id?: string
    name: string
    countryCode: string
}

export interface ILocationCityLite {
    // In list/get responses, backend excludes _id for populated city.
    // In patch responses, backend may include _id.
    _id?: string
    name: string
    cityCode: string
    countryId: string | ILocationCountryLite
}

export interface ILocation {
    _id: string
    type: number
    label: string
    locationCode: string
    // Backend populates cityId in most admin responses, but may return ObjectId string in other cases.
    cityId: string | ILocationCityLite
    postalCode: string
    street: string
}
