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
    ADMIN_SAME_ID: 'You cannot perform this action on your own account.',
}

export const SPEAKERS_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    NAME_REQUIRED: 'Speaker name is required.',
    BIO_REQUIRED: 'Speaker bio is required.',
    NOT_FOUND: 'This speaker was not found.',
    ID_REQUIRED: 'Speaker ID is required!',
    NO_FIELDS_TO_UPDATE:
        'No fields provided to update. Specify at least one: name, bio, contacts.telegram|phone|email, photo.name|alt.',
}

export const EVENTS_ERRORS = {
    REQUIRED_FIELDS: 'All fields must be filled in!',
    MISSING_FIELDS: 'Missing required fields',
    COVER_MISSING: 'Event cover is required!',
    INVALID_DATES: 'startsAt and endsAt must be valid dates!',
    ENDS_AFTER_START: 'endsAt must be after startsAt!',
    INVALID_CAPACITY: 'capacity must be a positive number!',
    NOT_FOUND: 'This event was not found.',
    ID_REQUIRED: 'Event ID is required!',
    CAPACITY_REACHED: 'Event capacity reached',
    CAPACITY_REACHED_MAXIMUM_CAPACITY: 'Event capacity reached. Maximum Capacity',
}

export const ATENDEE_ERRORS = {
    NOT_FOUND: 'This atendee was not found.',
    MISSING_FIELDS: 'Missing required fields',
    ALREADY_REGISTERED: 'User is already registered for this event',
    NOT_REGISTERED: 'User is not registered for this event',
}

export const INVITATION_ERRORS = {
    MISSING_FIELDS: 'Missing required fields',
    ALREADY_INVITED: 'This User is already invited for this event!',
    INVITE_YOURSELF: "You can't invite yourself",
    ID_REQUIRED: 'Invitation ID is required!',
    NOT_FOUND: 'This invite was not found!',
    NO_INVITATION: 'There is no invitation to this event for you',
    ALREADY_PARTICIPATING: 'The user is already participating in the event',
}

export const TICKET_ERRORS = {
    MISSING_FIELDS: 'Missing required fields',
    INVALID_CODE: 'Invalid code!',
    INVALID_STATUS: 'Invalid status!',
    FAILED_TO_GENERATE_UNIQUE_CODE:
        'Failed to generate a unique ticket code. Please try again later.',
    ATENDEE_ID_REQUIRED: 'Atendee ID is required!',
    NOT_FOUND: 'This ticket was not found!',
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
