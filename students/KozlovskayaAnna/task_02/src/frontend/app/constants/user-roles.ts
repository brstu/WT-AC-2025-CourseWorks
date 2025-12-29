export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
} as const

export type EUserRoles = (typeof USER_ROLES)[keyof typeof USER_ROLES]
