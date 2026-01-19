import { Model } from 'mongoose'

export interface ICountry {
    _id: string
    name: string
    countryCode: string
}

export interface CountryStatics {
    createCountry(
        { countryCode, name }: { countryCode: string; name: string },
        select?: string
    ): Promise<ICountry>
    patchCountry(
        { _id, countryCode, name }: { _id: string; countryCode: string; name: string },
        select?: string
    ): Promise<ICountry>
    deleteCountry({ _id }: { _id: string }, select?: string): Promise<ICountry>
}

export type CountryModel = Model<ICountry> & CountryStatics
