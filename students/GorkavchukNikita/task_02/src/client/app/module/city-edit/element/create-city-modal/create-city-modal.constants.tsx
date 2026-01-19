import type { RegisterOptions } from 'react-hook-form'

import { CITY_ERRORS } from '@/app/constants'

type FormValues = {
    name: string
    cityCode: string
    countryId: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const createCityFormFields: {
    name: FieldConfig<'name'>
    cityCode: FieldConfig<'cityCode'>
    countryId: FieldConfig<'countryId'>
} = {
    name: {
        fieldName: 'name',
        placeholder: 'name',
        validationOptions: {
            required: CITY_ERRORS.NAME_REQUIRED,
        },
    },
    cityCode: {
        fieldName: 'cityCode',
        placeholder: 'cityCode',
        validationOptions: {
            required: CITY_ERRORS.CITY_CODE_REQUIRED,
        },
    },
    countryId: {
        fieldName: 'countryId',
        placeholder: 'countryId',
        validationOptions: {
            required: CITY_ERRORS.COUNTRY_REQUIRED,
        },
    },
}
