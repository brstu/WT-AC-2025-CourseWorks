import { cookies } from 'next/headers'
import { IRes, EResponseStatus, ITicket } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'

export const getTicketsServer = async () => {
    try {
        const cookieStore = await cookies()
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/`, {
            headers: {
                Cookie: cookieHeader,
            },
            method: 'GET',
        })
        const json: IRes<{ tickets: ITicket[] }> = await response.json()

        if (json.status === EResponseStatus.error) {
            throw new Error(json.message)
        }

        return json.data?.tickets
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        console.warn(message)
    }
}
