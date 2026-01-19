import Link from 'next/link'

import { LogoComponent } from '@/app/shared/component/logo'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { User } from './element/user'
import { IUser } from '@/app/shared/interface'
import { EAppRoutes } from '@/app/constants'
import { Button } from '@/app/shared/component/button'
import { Box } from 'lucide-react'

interface IProps {
    initialUser: IUser | null
    role: string
}

export const HeaderComponent = ({ initialUser, role }: IProps) => {
    return (
        <header className="sticky top-0 z-50 py-2 bg-transparent backdrop-blur-lg backdrop-saturate-150">
            <WrapperComponent className="flex justify-between gap-x-5 gap-y-2 flex-wrap">
                <div className="flex items-center justify-center">
                    <Link href={EAppRoutes.BASE} className="inline-block">
                        <LogoComponent />
                    </Link>
                </div>

                <div className="flex gap-4 ml-auto">
                    {initialUser && (
                        <>
                            <Link href={EAppRoutes.ORDERS} className="hidden md:flex">
                                <Button
                                    color="black"
                                    variant="ghost"
                                    startIcon={Box}
                                    disableOutline
                                >
                                    Orders
                                </Button>
                            </Link>

                            <Link href={EAppRoutes.ORDERS} className="flex md:hidden">
                                <Button
                                    color="black"
                                    variant="ghost"
                                    startIcon={Box}
                                    disableOutline
                                />
                            </Link>
                        </>
                    )}

                    <User initialUser={initialUser} role={role} />
                </div>
            </WrapperComponent>
        </header>
    )
}
