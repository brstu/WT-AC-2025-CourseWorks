export const EVENT_FORM_ERRORS = {
    LOCATION_REQUIRED: 'Location is required!',
    STATUS_REQUIRED: 'Status is required!',
}

export const createEventFormFields = {
    location: {
        fieldName: 'location',
        validationOptions: {
            required: EVENT_FORM_ERRORS.LOCATION_REQUIRED,
        },
    },
    status: {
        fieldName: 'status',
        validationOptions: {
            required: EVENT_FORM_ERRORS.STATUS_REQUIRED,
        },
    },
    description: {
        fieldName: 'description',
        validationOptions: {},
    },
} as const
