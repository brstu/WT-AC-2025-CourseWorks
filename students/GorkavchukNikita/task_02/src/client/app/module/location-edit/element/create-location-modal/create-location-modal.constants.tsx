import type { RegisterOptions } from 'react-hook-form'

import { LOCATION_ERRORS } from '@/app/constants'

type FormValues = {
    type: number | undefined
    label: string
    locationCode: string
    cityId: string
    postalCode: string
    street: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const createLocationFormFields: {
    type: FieldConfig<'type'>
    label: FieldConfig<'label'>
    locationCode: FieldConfig<'locationCode'>
    cityId: FieldConfig<'cityId'>
    postalCode: FieldConfig<'postalCode'>
    street: FieldConfig<'street'>
} = {
    type: {
        fieldName: 'type',
        placeholder: 'type',
        validationOptions: {
            required: LOCATION_ERRORS.TYPE_REQUIRED,
            setValueAs: (v) =>
                v === '' || v === null || typeof v === 'undefined' ? undefined : Number(v),
            validate: (v) => {
                if (!v) return
                return Number.isInteger(v) && v >= 0 && v <= 4 ? true : LOCATION_ERRORS.INVALID_TYPE
            },
        },
    },
    label: {
        fieldName: 'label',
        placeholder: 'label',
        validationOptions: {
            required: LOCATION_ERRORS.LABEL_REQUIRED,
        },
    },
    locationCode: {
        fieldName: 'locationCode',
        placeholder: 'locationCode',
        validationOptions: {
            required: LOCATION_ERRORS.LOCATION_CODE_REQUIRED,
        },
    },
    cityId: {
        fieldName: 'cityId',
        placeholder: 'cityId',
        validationOptions: {
            required: LOCATION_ERRORS.CITY_REQUIRED,
        },
    },
    postalCode: {
        fieldName: 'postalCode',
        placeholder: 'postalCode',
        validationOptions: {
            required: LOCATION_ERRORS.POSTAL_CODE_REQUIRED,
        },
    },
    street: {
        fieldName: 'street',
        placeholder: 'street',
        validationOptions: {
            required: LOCATION_ERRORS.STREET_REQUIRED,
        },
    },
}
