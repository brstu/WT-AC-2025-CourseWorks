'use client'

import { useEffect, useState } from 'react'

import { MenuItem } from './element/menu-item'
import { links } from './menu.constants'
import { USER_ROLES } from '@/app/constants/user-roles'
import { useGetUserRole } from '@/app/shared/hooks/'

export const MenuComponent = () => {
    const { getUserRole } = useGetUserRole()

    // по умолчанию — обычный пользователь
    const [role, setRole] = useState<string>(USER_ROLES.USER)

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const fetchedRole = await getUserRole()
                if (fetchedRole) {
                    setRole(fetchedRole)
                }
            } catch {
                setRole(USER_ROLES.USER)
            }
        }

        fetchRole()
    }, [getUserRole])

    return (
        <div className="overflow-auto pb-4 lg:pb-0">
            <div className="flex gap-6 w-max lg:w-full lg:flex-col">
                {links.map((bubble, index) => {
                    if (role !== USER_ROLES.ADMIN && bubble.isAdmin) {
                        return null
                    }

                    return (
                        <div className="flex lg:block" key={`menu_bubble_${index}`}>
                            {bubble.items.map((item, idx) => (
                                <MenuItem
                                    key={`menu_bubble_item_${idx}`}
                                    title={item.fieldName}
                                    icon={item.icon}
                                    href={item.href}
                                    color={item.color}
                                    isFirst={idx === 0}
                                    isLast={idx === bubble.items.length - 1}
                                    isSingle={bubble.items.length === 1}
                                />
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
