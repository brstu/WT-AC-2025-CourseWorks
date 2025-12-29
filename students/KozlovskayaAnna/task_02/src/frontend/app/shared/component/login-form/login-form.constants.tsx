import { USER_ERRORS } from '@/app/constants/errors'
import type { RegisterOptions } from 'react-hook-form'

type FormValues = {
    email: string
    password: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const loginFormFields: { email: FieldConfig<'email'>; password: FieldConfig<'password'> } = {
    email: {
        fieldName: 'email',
        placeholder: 'email',
        validationOptions: {
            required: USER_ERRORS.EMAIL_REQUIRED,
        },
    },
    password: {
        fieldName: 'password',
        placeholder: 'password',
        validationOptions: {
            required: USER_ERRORS.PASSWORD_REQUIRED,
            minLength: {
                value: 6,
                message: USER_ERRORS.PASSWORD_SHORT,
            },
        },
    },
}
