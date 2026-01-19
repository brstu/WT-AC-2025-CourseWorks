export const USER_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    PASSWORD_SHORT: 'Password must be more than 6 characters long!',
    PASSWORD_INCORRECT: 'Incorrect password!',
    ALREADY_EXISTS: 'This user already exists!',
    NOT_FOUND: 'This user was not found!',
    ID_REQUIRED: 'User ID is required!',
    EMAIL_REQUIRED: 'Email is required!',
    PASSWORD_REQUIRED: 'Password is required!',
    INVALID_ROLE: 'Invalid user role!',
    PASSWORD_SAME_AS_OLD: 'New password must be different from the old one.',

    ADMIN_EMAIL_EXIST: 'A user with this email already exists',
    ADMIN_PHONE_EXIST: 'A user with this phone number already exists',
    ADMIN_SAME_ID: 'You cannot perform this action on your own account.',
}

export const COUNTRY_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    COUNTRY_CODE_USING: 'Country with this code already exists!',
    INVALID_COUNTRY_CODE: 'Invalid country code!',
    ID_REQUIRED: 'Country ID is required!',
    NOT_FOUND: 'This country was not found!',
    NOTHING_TO_UPDATE: 'Nothing to update!',
}

export const CITY_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    CITY_CODE_USING: 'City with this code already exists!',
    ID_REQUIRED: 'City ID is required!',
    NOT_FOUND: 'This city was not found!',
    NOTHING_TO_UPDATE: 'Nothing to update!',
}

export const LOCATION_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    LOCATION_CODE_USING: 'Location with this code already exists!',
    NOT_FOUND: 'This location was not found!',
    ID_REQUIRED: 'Location ID is required!',
    NOTHING_TO_UPDATE: 'Nothing to update!',
}

export const ORDER_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    GENERATE_CODE_FAILED: 'Failed to generate a unique order code',
    UNDEFINED_OID: 'Missing OID!',
    NOT_FOUND: 'This order was not found!',
}

export const EVENT_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    GENERATE_CODE_FAILED: 'Failed to generate a unique order code',
    ID_REQUIRED: 'Event ID is required!',
    NOT_FOUND: 'This event was not found!',
}

export const COMMON_ERRORS = {
    UNEXPECTED: 'Unexpected error',
    ROUTE_NOT_FOUND: 'Route not found',
}

export const AUTH_ERRORS = {
    TOKEN_REQUIRED: 'Authorization token required',
    TOKEN_INVALID: 'Request is not authorized',
}

export const JWT_ERRORS = {
    SECRET_NOT_DEFINED: 'JWT_SECRET is not defined',
    EXPIRES_NOT_DEFINED: 'JWT_EXPIRES_IN is not defined',
}
