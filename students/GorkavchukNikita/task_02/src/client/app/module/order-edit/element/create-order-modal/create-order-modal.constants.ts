export const ORDER_FORM_ERRORS = {
    NAME_REQUIRED: 'Order name is required!',
    USER_REQUIRED: 'User is required!',
    PICKUP_LOCATION_REQUIRED: 'Pickup location is required!',
}

export const createOrderFormFields = {
    name: {
        fieldName: 'name',
        validationOptions: {
            required: ORDER_FORM_ERRORS.NAME_REQUIRED,
        },
    },
    userId: {
        fieldName: 'userId',
        validationOptions: {
            required: ORDER_FORM_ERRORS.USER_REQUIRED,
        },
    },
    pickupLocation: {
        fieldName: 'pickupLocation',
        validationOptions: {
            required: ORDER_FORM_ERRORS.PICKUP_LOCATION_REQUIRED,
        },
    },
    currentLocation: {
        fieldName: 'currentLocation',
        validationOptions: {},
    },
} as const
