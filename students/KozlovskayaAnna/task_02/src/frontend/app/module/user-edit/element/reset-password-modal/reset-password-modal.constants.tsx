import type { RegisterOptions } from 'react-hook-form'
import { USER_ERRORS } from '@/app/constants/errors'

type FormValues = {
    password: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const resetPasswordFormFields: {
    password: FieldConfig<'password'>
} = {
    password: {
        fieldName: 'password',
        placeholder: 'password',
        validationOptions: {
            required: USER_ERRORS.PASSWORD_REQUIRED,
        },
    },
}
