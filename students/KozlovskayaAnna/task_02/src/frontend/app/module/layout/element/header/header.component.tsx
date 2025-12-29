import Link from 'next/link'

import { LogoComponent } from '@/app/shared/component/logo'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { User } from './element/user'
import { IUser } from '@/app/shared/interface'

interface IProps {
    initialUser: IUser | null
    isLoading: boolean
}

export const HeaderComponent = ({ isLoading, initialUser }: IProps) => {
    return (
        <header className="sticky top-0 z-50 bg-background py-2">
            <WrapperComponent className="grid justify-center grid-cols-[1fr_256px_1fr] items-center text-light">
                <div className="col-start-2 flex items-center justify-center">
                    <Link href={'/'} className="inline-block">
                        <LogoComponent />
                    </Link>
                </div>

                <div className="flex justify-end">
                    {isLoading ? (
                        <div className="py-2.5">
                            <div className="w-[80px] h-[16px] bg-gray-100/50 rounded-md animate-pulse" />
                        </div>
                    ) : (
                        <User initialUser={initialUser} />
                    )}
                </div>
            </WrapperComponent>
        </header>
    )
}
