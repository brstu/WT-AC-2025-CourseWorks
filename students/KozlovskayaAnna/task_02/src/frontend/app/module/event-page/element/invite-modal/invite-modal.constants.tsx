import { USER_ERRORS } from '@/app/constants/errors'
import type { RegisterOptions } from 'react-hook-form'

type FormValues = {
    email: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const inviteFormFields: { email: FieldConfig<'email'> } = {
    email: {
        fieldName: 'email',
        placeholder: 'email',
        validationOptions: {
            required: USER_ERRORS.EMAIL_REQUIRED,
        },
    },
}
