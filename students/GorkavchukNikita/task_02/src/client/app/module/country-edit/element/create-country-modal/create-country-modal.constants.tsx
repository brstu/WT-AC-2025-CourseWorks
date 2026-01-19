import type { RegisterOptions } from 'react-hook-form'

import { COUNTRY_ERRORS } from '@/app/constants'

type FormValues = {
    name: string
    countryCode: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const createCountryFormFields: {
    name: FieldConfig<'name'>
    countryCode: FieldConfig<'countryCode'>
} = {
    name: {
        fieldName: 'name',
        placeholder: 'name',
        validationOptions: {
            required: COUNTRY_ERRORS.NAME_REQUIRED,
        },
    },
    countryCode: {
        fieldName: 'countryCode',
        placeholder: 'countryCode',
        validationOptions: {
            required: COUNTRY_ERRORS.COUNTRY_CODE_REQUIRED,
            pattern: {
                value: /^[A-Za-z]{2,3}$/,
                message: COUNTRY_ERRORS.INVALID_COUNTRY_CODE,
            },
        },
    },
}
