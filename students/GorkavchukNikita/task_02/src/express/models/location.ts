import { Schema, model, models } from 'mongoose'
import { ILocation, LocationModel } from '../types/location'
import { LOCATION_ERRORS } from '../constants/errors'

export const locationSchema = new Schema<ILocation, LocationModel>({
    type: {
        type: Number,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    locationCode: {
        type: String,
        required: true,
        unique: true,
    },
    cityId: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
})

locationSchema.statics.createLocation = async function (props) {
    const { type, label, locationCode, cityId, postalCode, street } = props

    for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === '') {
            throw new Error(`${LOCATION_ERRORS.REQUIRED_FIELDS}: ${key}`)
        }
    }

    const isExist = await this.findOne({ locationCode })

    if (isExist) {
        throw new Error(LOCATION_ERRORS.LOCATION_CODE_USING)
    }

    const location = await this.create({ type, label, locationCode, cityId, postalCode, street })

    return location
}

locationSchema.statics.patchLocation = async function (props) {
    const { _id, locationCode, ...rest } = props

    if (!_id) {
        throw new Error(LOCATION_ERRORS.ID_REQUIRED)
    }

    const location = await this.findById(_id)
    if (!location) {
        throw new Error(LOCATION_ERRORS.NOT_FOUND)
    }

    const update: Record<string, any> = {}

    if (locationCode && locationCode !== location.locationCode) {
        const isExist = await this.findOne({ locationCode, _id: { $ne: _id } })
        if (isExist) {
            throw new Error(LOCATION_ERRORS.LOCATION_CODE_USING)
        }

        update.locationCode = locationCode
    }

    for (const [key, value] of Object.entries({ ...rest })) {
        if (value !== undefined) {
            update[key] = value
        }
    }

    if (Object.keys(update).length === 0) {
        throw new Error(LOCATION_ERRORS.NOTHING_TO_UPDATE)
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
        throw new Error(LOCATION_ERRORS.NOT_FOUND)
    }

    return updated
}

locationSchema.statics.deleteLocation = async function ({ _id }) {
    if (!_id) {
        throw new Error(LOCATION_ERRORS.ID_REQUIRED)
    }

    const deleted = await this.findByIdAndDelete(_id)
    if (!deleted) {
        throw new Error(LOCATION_ERRORS.NOT_FOUND)
    }
    return deleted
}

export const Location =
    (models.Location as LocationModel) ||
    model<ILocation, LocationModel>('Location', locationSchema)
