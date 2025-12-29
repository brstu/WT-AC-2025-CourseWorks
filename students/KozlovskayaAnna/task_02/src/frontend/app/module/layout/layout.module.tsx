'use client'

import React, { useEffect, useState } from 'react'

import type { IRes, IUser } from '@/app/shared/interface'
import { useGetUserProfile } from '@/app/shared/hooks/'

import { ClientInitializer } from '@/app/shared/component/client-initializer'
import { HeaderComponent } from './element/header'
import { FooterComponent } from './element/footer'

interface IProps {
    children: React.ReactNode
}

export const LayoutModule = ({ children }: IProps) => {
    const { isLoading, getUserProfile } = useGetUserProfile()
    const [userProfile, setUserProfile] = useState<IUser | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data: IRes<{ user: IUser }> = await getUserProfile()
                setUserProfile(data?.data?.user ?? null)
            } catch {
                setUserProfile(null)
            }
        }

        fetchProfile()
    }, [getUserProfile])

    return (
        <div className="flex flex-col min-h-dvh">
            <HeaderComponent initialUser={userProfile} isLoading={isLoading} />

            <main className="flex-1 bg-background-main">{children}</main>

            <FooterComponent />

            <ClientInitializer initialUser={userProfile} />
        </div>
    )
}
