import type { RegisterOptions } from 'react-hook-form'
import { USER_ERRORS } from '@/app/constants/errors'

type FormValues = {
    name: string
    email: string
    password: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const createUserFormFields: {
    name: FieldConfig<'name'>
    email: FieldConfig<'email'>
    password: FieldConfig<'password'>
} = {
    name: {
        fieldName: 'name',
        placeholder: 'name',
        validationOptions: {
            required: USER_ERRORS.NAME_REQUIRED,
        },
    },
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
        },
    },
}
