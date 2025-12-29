import { cookies } from 'next/headers'
import { IRes } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { USER_ROLES } from '@/app/constants/user-roles'

export async function getUserRole() {
    try {
        const cookieStore = await cookies()
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/role`, {
            headers: {
                Cookie: cookieHeader,
            },
            cache: 'no-store',
        })
        const json: IRes<{ role: string }> = await response.json()

        if (!json.data?.role) {
            return USER_ROLES.USER
        }

        return json.data.role
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        console.warn(message)

        return null
    }
}
