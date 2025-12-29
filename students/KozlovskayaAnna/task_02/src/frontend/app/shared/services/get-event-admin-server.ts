import { cookies } from 'next/headers'
import { IRes, IEventAdmin } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

export async function getEventAdminServer(id: string) {
    try {
        const cookieStore = await cookies()
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ADMIN_BASE_URL}/events/${id}`, {
            headers: {
                Cookie: cookieHeader,
            },
            method: 'GET',
        })
        const json: IRes<{ event: IEventAdmin }> = await response.json()

        if (!json.data?.event) {
            return null
        }

        return json.data.event
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        console.warn(message)

        return null
    }
}
