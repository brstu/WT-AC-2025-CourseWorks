import { HydratedDocument, Model, Types } from 'mongoose'

export interface ICity {
    _id: string
    name: string
    cityCode: string
    countryId: Types.ObjectId
}

export type CityDoc = HydratedDocument<ICity>

export interface CityStatics {
    createCity(
        { name, cityCode, countryId }: { countryId: string; name: string; cityCode: string },
        select?: string
    ): Promise<CityDoc>
    patchCity(
        {
            _id,
            name,
            cityCode,
            countryId,
        }: { _id: string; countryId: string; name: string; cityCode: string },
        select?: string
    ): Promise<CityDoc>
    deleteCity({ _id }: { _id: string }, select?: string): Promise<CityDoc>
}

export type CityModel = Model<ICity> & CityStatics
