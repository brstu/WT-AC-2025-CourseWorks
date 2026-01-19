'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { EAppRoutes } from '@/app/constants'
import { WrapperComponent } from '@/app/shared/component/wrapper'

type NavItem = {
    label: string
    href: string
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Users', href: EAppRoutes.ADMIN_USERS },
    { label: 'Countries', href: EAppRoutes.ADMIN_COUNTRIES },
    { label: 'Cities', href: EAppRoutes.ADMIN_CITIES },
    { label: 'Locations', href: EAppRoutes.ADMIN_LOCATIONS },
    { label: 'Orders', href: EAppRoutes.ADMIN_ORDERS },
]

const isActiveRoute = (pathname: string, href: string) => {
    // "Admin" root shouldn't stay active for every /admin/* page.
    if (href === EAppRoutes.ADMIN) return pathname === href

    return pathname === href || pathname.startsWith(`${href}/`)
}

export const AdminNavComponent = () => {
    const pathname = usePathname() ?? ''

    return (
        <div className="border-b border-gray-200 bg-background-main">
            <WrapperComponent className="flex items-center justify-between gap-3 py-2">
                {/* <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Admin</span>
                </div> */}

                <nav className="flex-1 overflow-x-auto">
                    <ul className="flex items-center justify-end gap-1 whitespace-nowrap">
                        {NAV_ITEMS.map((item) => {
                            const active = isActiveRoute(pathname, item.href)

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={clsx(
                                            'inline-flex items-center rounded-md px-3 py-1.5 text-sm transition-colors',
                                            active
                                                ? 'bg-slate-200 font-medium text-foreground'
                                                : 'text-gray-600 hover:bg-slate-100 hover:text-foreground'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </WrapperComponent>
        </div>
    )
}
