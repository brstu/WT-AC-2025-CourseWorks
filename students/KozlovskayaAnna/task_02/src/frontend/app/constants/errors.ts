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
