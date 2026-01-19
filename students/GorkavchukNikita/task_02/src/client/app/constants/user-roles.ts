export const EUserRoles = {
    ADMIN: 'admin',
    USER: 'user',
} as const

export type EUserRoles = (typeof EUserRoles)[keyof typeof EUserRoles]
