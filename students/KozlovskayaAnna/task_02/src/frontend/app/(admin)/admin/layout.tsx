'use client'

import React, { useEffect, useState } from 'react'

import { USER_ROLES } from '@/app/constants/user-roles'
import { NotFoundModule } from '@/app/module/not-found'
import { useGetUserRole } from '@/app/shared/hooks'

interface IProps {
    children: React.ReactNode
}

export default function Layout({ children }: Readonly<IProps>) {
    const { isLoading, getUserRole } = useGetUserRole()
    const [role, setRole] = useState<string | null>(null)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const userRole = await getUserRole()
                setRole(userRole)
            } catch {
                setRole(null)
            } finally {
                setChecked(true)
            }
        }

        fetchRole()
    }, [getUserRole])

    if (isLoading || !checked) {
        return null
    }

    if (role !== USER_ROLES.ADMIN) {
        return <NotFoundModule />
    }

    return children
}
