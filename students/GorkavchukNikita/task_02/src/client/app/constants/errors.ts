export const USER_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    PASSWORD_SHORT: 'Password must be more than 6 characters long!',
    PASSWORD_INCORRECT: 'Incorrect password!',
    ALREADY_EXISTS: 'This user already exists!',
    NOT_FOUND: 'This user was not found!',
    ID_REQUIRED: 'User ID is required!',
    EMAIL_REQUIRED: 'Email is required!',
    PASSWORD_REQUIRED: 'Password is required!',
    NAME_REQUIRED: 'Name is required!',
    ROLE_REQUIRED: 'Role is required!',
    INVALID_ROLE: 'Invalid user role!',
    PASSWORD_SAME_AS_OLD: 'New password must be different from the old one.',
}

export const COUNTRY_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    COUNTRY_CODE_REQUIRED: 'Country code is required!',
    NAME_REQUIRED: 'Country name is required!',
    INVALID_COUNTRY_CODE: 'Invalid country code!',
    ID_REQUIRED: 'Country ID is required!',
    NOT_FOUND: 'This country was not found!',
}

export const CITY_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    CITY_CODE_REQUIRED: 'City code is required!',
    NAME_REQUIRED: 'City name is required!',
    COUNTRY_REQUIRED: 'Country is required!',
    CITY_CODE_USING: 'City with this code already exists!',
    ID_REQUIRED: 'City ID is required!',
    NOT_FOUND: 'This city was not found!',
    NOTHING_TO_UPDATE: 'Nothing to update!',
    INVALID_CITY_CODE: 'Invalid city code!',
}

export const LOCATION_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    TYPE_REQUIRED: 'Location type is required!',
    INVALID_TYPE: 'Invalid location type!',
    LABEL_REQUIRED: 'Location label is required!',
    LOCATION_CODE_REQUIRED: 'Location code is required!',
    CITY_REQUIRED: 'City is required!',
    POSTAL_CODE_REQUIRED: 'Postal code is required!',
    STREET_REQUIRED: 'Street is required!',
    LOCATION_CODE_USING: 'Location with this code already exists!',
    ID_REQUIRED: 'Location ID is required!',
    NOT_FOUND: 'This location was not found!',
    NOTHING_TO_UPDATE: 'Nothing to update!',
}

export const SPEAKERS_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    NAME_REQUIRED: 'Speaker name is required.',
    BIO_REQUIRED: 'Speaker bio is required.',
    NOT_FOUND: 'This speaker was not found.',
    ID_REQUIRED: 'Speaker ID is required!',
    TELEGRAM_REQUIRED: 'Telegram is required!',
    PHONE_REQUIRED: 'Phone is required!',
    EMAIL_REQUIRED: 'Email is required!',
    ALT_REQUIRED: 'Alt is required!',
    PHOTO_REQUIRED: 'Photo is required!',
    NO_FIELDS_TO_UPDATE:
        'No fields provided to update. Specify at least one: name, bio, contacts.telegram|phone|email, photo.name|alt.',
}

export const COMMON_ERRORS = {
    UNEXPECTED: 'Unexpected error',
    FAILED_TO_FETCH_USER_PROFILE: 'Failed to fetch user profile',
}
