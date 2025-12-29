'use client'

import Link from 'next/link'
import { Menu, MenuButton, MenuItem, Transition } from '@headlessui/react'
import { IUser } from '@/app/shared/interface'
import { useUserStore } from '@/app/shared/store'
import { User as UserIcon, LogIn, LogOut } from 'lucide-react'

import { Button } from '@/app/shared/component/button'
import { useUserServices } from './user.services'

interface IProps {
    initialUser: IUser | null
}

export const User = ({ initialUser }: IProps) => {
    const userFromStore = useUserStore((state) => state.user)
    const thisServices = useUserServices()

    const user = userFromStore || initialUser

    if (!user) {
        return (
            <Link href="/login">
                <Button
                    color="white"
                    variant="ghost"
                    endIcon={LogIn}
                    endIconClassName="translate-y-px"
                    className="hidden md:flex"
                >
                    Log In
                </Button>

                <Button
                    color="white"
                    variant="ghost"
                    endIcon={LogIn}
                    endIconClassName="translate-y-px"
                    className="flex md:hidden"
                />
            </Link>
        )
    }

    return (
        <div className="flex items-center">
            <Menu as={'div'} className="relative">
                <MenuButton
                    as={Button}
                    color="white"
                    variant="ghost"
                    startIcon={UserIcon}
                    className="hidden md:flex"
                    disableOutline
                >
                    {user.name}
                </MenuButton>

                <MenuButton
                    as={Button}
                    color="white"
                    variant="ghost"
                    startIcon={UserIcon}
                    className="flex md:hidden"
                    disableOutline
                />

                <Transition
                    as={'div'}
                    className="absolute top-full right-0 w-48"
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <div className="flex flex-col p-1 bg-gray-100 border-2 border-gray-200 rounded-[10px]">
                        <div className="text-xs text-black/50 pb-1 mb-1 border-b border-gray-200">
                            <span className="inline-block md:hidden">
                                {user.name} ({user.email})
                            </span>
                            <span className="hidden md:inline-block">{user.email}</span>
                        </div>
                        <MenuItem>
                            <Button
                                variant="soft"
                                color="danger"
                                startIcon={LogOut}
                                onClick={() => thisServices.logout()}
                                isSubmiting={thisServices.loading}
                            >
                                Log Out
                            </Button>
                        </MenuItem>
                    </div>
                </Transition>
            </Menu>
        </div>
    )
}
