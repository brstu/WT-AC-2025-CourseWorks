import { cookies } from 'next/headers'
import { IRes, IUser } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

export async function getUserProfileServer() {
    try {
        const cookieStore = await cookies()
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/profile`, {
            headers: {
                Cookie: cookieHeader,
            },
            cache: 'no-store',
        })
        const json: IRes<{ user: IUser }> = await response.json()

        if (!json.data?.user) {
            return null
        }

        return json.data?.user
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        console.warn(message)

        return null
    }
}
