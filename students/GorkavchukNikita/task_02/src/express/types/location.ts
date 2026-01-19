import { HydratedDocument, Model, Types } from 'mongoose'

export interface ILocation {
    _id: string
    type: number
    label: string
    locationCode: string
    cityId: Types.ObjectId
    postalCode: string
    street: string
}

export type LocationDoc = HydratedDocument<ILocation>

export interface LocationStatics {
    createLocation(
        {
            type,
            label,
            locationCode,
            cityId,
            postalCode,
            street,
        }: {
            type: number
            label: string
            locationCode: string
            cityId: string
            postalCode: string
            street: string
        },
        select?: string
    ): Promise<LocationDoc>
    patchLocation(
        {
            _id,
            type,
            label,
            locationCode,
            cityId,
            postalCode,
            street,
        }: {
            _id: string
            type: number
            label: string
            locationCode: string
            cityId: string
            postalCode: string
            street: string
        },
        select?: string
    ): Promise<LocationDoc>
    deleteLocation({ _id }: { _id: string }, select?: string): Promise<LocationDoc>
}

export type LocationModel = Model<ILocation> & LocationStatics
