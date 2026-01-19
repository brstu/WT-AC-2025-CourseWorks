import { Schema, model, models } from 'mongoose'
import { ICity, CityModel } from '../types/city'
import { CITY_ERRORS } from '../constants/errors'

export const citySchema = new Schema<ICity, CityModel>({
    cityCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: true,
    },
    countryId: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
    },
})

citySchema.statics.createCity = async function ({ name, cityCode, countryId }) {
    if (!name || !cityCode || !countryId) {
        throw new Error(CITY_ERRORS.REQUIRED_FIELDS)
    }

    const isExist = await this.findOne({ cityCode })

    if (isExist) {
        throw new Error(CITY_ERRORS.CITY_CODE_USING)
    }

    const city = await this.create({ name, cityCode, countryId })

    return city
}

citySchema.statics.patchCity = async function ({ _id, name, cityCode, countryId }) {
    if (!_id) {
        throw new Error(CITY_ERRORS.ID_REQUIRED)
    }

    const current = await this.findById(_id)

    if (!current) {
        throw new Error(CITY_ERRORS.NOT_FOUND)
    }

    const update: Record<string, any> = {}

    if (typeof name !== 'undefined') {
        update.name = name
    }

    if (cityCode) {
        const normalized = cityCode.trim().toUpperCase()

        const cityCodeExist = await this.findOne({
            cityCode: normalized,
            _id: { $ne: _id },
        })

        if (cityCodeExist) {
            throw new Error(CITY_ERRORS.CITY_CODE_USING)
        }

        update.cityCode = normalized
    }

    if (typeof countryId !== 'undefined') {
        update.countryId = countryId
    }

    if (Object.keys(update).length === 0) {
        throw new Error(CITY_ERRORS.NOTHING_TO_UPDATE)
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
        throw new Error(CITY_ERRORS.NOT_FOUND)
    }

    return updated
}

citySchema.statics.deleteCity = async function ({ _id }) {
    if (!_id) {
        throw new Error(CITY_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id)
    if (!deleted) {
        throw new Error(CITY_ERRORS.NOT_FOUND)
    }
    return deleted
}

export const City = (models.City as CityModel) || model<ICity, CityModel>('City', citySchema)
