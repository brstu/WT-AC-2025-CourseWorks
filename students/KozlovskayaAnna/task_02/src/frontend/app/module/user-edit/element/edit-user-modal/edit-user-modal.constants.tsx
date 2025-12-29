import type { RegisterOptions } from 'react-hook-form'
import { USER_ERRORS } from '@/app/constants/errors'

type FormValues = {
    name: string
    email: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const editUserFormFields: {
    name: FieldConfig<'name'>
    email: FieldConfig<'email'>
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
}
