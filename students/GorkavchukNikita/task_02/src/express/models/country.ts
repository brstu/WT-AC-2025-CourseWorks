import { Schema, model, models } from 'mongoose'
import { ICountry, CountryModel } from '../types/country'
import { COUNTRY_ERRORS } from '../constants/errors'

export const countrySchema = new Schema<ICountry, CountryModel>({
    countryCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        match: [/^[A-Z]{2,3}$/, COUNTRY_ERRORS.INVALID_COUNTRY_CODE],
    },
    name: {
        type: String,
        required: true,
    },
})

countrySchema.statics.createCountry = async function ({ name, countryCode }) {
    if (!name || !countryCode) {
        throw new Error(COUNTRY_ERRORS.REQUIRED_FIELDS)
    }

    const isExist = await this.findOne({ countryCode })

    if (isExist) {
        throw new Error(COUNTRY_ERRORS.COUNTRY_CODE_USING)
    }

    const country = await this.create({ name, countryCode })

    return country
}

countrySchema.statics.patchCountry = async function ({ _id, name, countryCode }) {
    if (!_id) {
        throw new Error(COUNTRY_ERRORS.ID_REQUIRED)
    }

    const current = await this.findById(_id)

    if (!current) {
        throw new Error(COUNTRY_ERRORS.NOT_FOUND)
    }

    const countryCodeExist = await this.findOne({ countryCode: countryCode.trim().toUpperCase() })

    if (countryCodeExist) {
        throw new Error(COUNTRY_ERRORS.COUNTRY_CODE_USING)
    }

    const update: Record<string, any> = {}

    if (typeof name !== 'undefined') {
        update.name = name
    }

    if (typeof countryCode !== 'undefined') {
        update.countryCode = countryCode.trim().toUpperCase()
    }

    if (Object.keys(update).length === 0) {
        throw new Error(COUNTRY_ERRORS.NOTHING_TO_UPDATE)
    }

    const updated = await this.findByIdAndUpdate(
        _id,
        { $set: update },
        {
            new: true,
            runValidators: true,
            context: 'query',
        }
    )

    if (!updated) {
        throw new Error(COUNTRY_ERRORS.NOT_FOUND)
    }

    return updated
}

countrySchema.statics.deleteCountry = async function ({ _id }) {
    if (!_id) {
        throw new Error(COUNTRY_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id)
    if (!deleted) {
        throw new Error(COUNTRY_ERRORS.NOT_FOUND)
    }
    return deleted
}

export const Country =
    (models.Country as CountryModel) || model<ICountry, CountryModel>('Country', countrySchema)
