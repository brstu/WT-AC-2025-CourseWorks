import { SPEAKERS_ERRORS } from '@/app/constants/errors'
import type { RegisterOptions } from 'react-hook-form'

type FormValues = {
    name: string
    bio: string
    alt: string
    telegram?: string
    email?: string
    phone?: string
}

type FieldConfig<K extends keyof FormValues> = {
    fieldName: K
    placeholder: string
    validationOptions?: RegisterOptions<FormValues, K>
}

export const editSpeakerFormFields: {
    name: FieldConfig<'name'>
    bio: FieldConfig<'bio'>
    alt: FieldConfig<'alt'>
    telegram: FieldConfig<'telegram'>
    email: FieldConfig<'email'>
    phone: FieldConfig<'phone'>
} = {
    name: {
        fieldName: 'name',
        placeholder: 'name',
        validationOptions: {
            required: SPEAKERS_ERRORS.NAME_REQUIRED,
        },
    },
    bio: {
        fieldName: 'bio',
        placeholder: 'bio',
        validationOptions: {
            required: SPEAKERS_ERRORS.BIO_REQUIRED,
        },
    },
    telegram: {
        fieldName: 'telegram',
        placeholder: 'telegram',
    },
    phone: {
        fieldName: 'phone',
        placeholder: 'phone',
    },
    email: {
        fieldName: 'email',
        placeholder: 'email',
    },
    alt: {
        fieldName: 'alt',
        placeholder: 'alt',
        validationOptions: {
            required: SPEAKERS_ERRORS.ALT_REQUIRED,
        },
    },
}
