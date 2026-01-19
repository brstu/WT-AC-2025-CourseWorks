import { EResponseStatus } from '@/app/shared/interface'
import { useState } from 'react'

export const useUserServices = () => {
    const [loading, setIsLoading] = useState<boolean>(false)

    const logout = async () => {
        try {
            setIsLoading(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/logout`, {
                method: 'POST',
                credentials: 'include',
            })

            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            if (typeof window !== 'undefined') {
                window.location.reload()
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unexpected error'
            console.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        logout,
        loading,
    }
}
