import React from 'react'

import { getUserProfileServer, getUserRole } from '@/app/shared/services'

import { ClientInitializer } from '@/app/shared/component/client-initializer'
import { EUserRoles } from '@/app/constants'

import { HeaderComponent } from './element/header'
import { FooterComponent } from './element/footer'

interface IProps {
    children: React.ReactNode
}

export const LayoutModule = async ({ children }: IProps) => {
    const userProfile = await getUserProfileServer()
    const role = await getUserRole()

    return (
        <div className="flex flex-col min-h-dvh">
            <HeaderComponent initialUser={userProfile} role={role || EUserRoles.USER} />

            <main className="flex-1 bg-background-main flex flex-col min-h-0">{children}</main>

            <FooterComponent />

            <ClientInitializer initialUser={userProfile} />
        </div>
    )
}
