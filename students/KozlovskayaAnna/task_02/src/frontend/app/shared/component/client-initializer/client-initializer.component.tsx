'use client'

import { useLayoutEffect } from 'react'
import { useUserStore } from '@/app/shared/store'
import { IUser } from '@/app/shared/interface/user.interface'

interface IProps {
    initialUser: IUser | null
}

export const ClientInitializer = ({ initialUser }: IProps) => {
    const setUser = useUserStore((state) => state.setUser)

    useLayoutEffect(() => {
        setUser(initialUser)
    }, [initialUser, setUser])

    return null
}
