import type { ICountry } from './country.interface'

export interface ICity {
    _id: string
    name: string
    cityCode: string
    // In list responses, backend returns ObjectId string (lean()).
    // In create/patch responses, backend populates this field.
    countryId: string | ICountry
}
