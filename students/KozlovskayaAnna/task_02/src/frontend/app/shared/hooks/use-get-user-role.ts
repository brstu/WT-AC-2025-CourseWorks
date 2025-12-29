'use client'

import { useState, useCallback } from 'react'

import { IRes } from '@/app/shared/interface'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { USER_ROLES } from '@/app/constants/user-roles'

type TUserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const useGetUserRole = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const getUserRole = useCallback(async (): Promise<TUserRole> => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/role`, {
                method: 'GET',
                credentials: 'include',
            })

            const json: IRes<{ role: TUserRole }> = await response.json()

            if (!response.ok || !json.data?.role) {
                return USER_ROLES.USER
            }

            return json.data.role
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            throw new Error(message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    return { isLoading, error, getUserRole }
}
