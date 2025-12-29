import clsx from 'clsx'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { LinkColor } from './menu-item.interface'

interface IProps {
    title: string
    href: string
    icon: LucideIcon
    color: LinkColor
    isFirst: boolean
    isLast: boolean
    isSingle: boolean
}

export const MenuItem = ({
    title,
    href = '',
    icon: Icon,
    color = 'amber',
    isFirst,
    isLast,
    isSingle,
}: IProps) => {
    const colorStyles: Record<LinkColor, string> = {
        amber: 'menu-item-amber hover:text-amber-600 hover:bg-amber-600/10 hover:border-amber-600',
        violet: 'menu-item-violet hover:text-violet-600 hover:bg-violet-600/10 hover:border-violet-600',
        indigo: 'menu-item-indigo hover:text-indigo-600 hover:bg-indigo-600/10 hover:border-indigo-600',
        rose: 'menu-item-rose hover:text-rose-600 hover:bg-rose-600/10 hover:border-rose-600',
        danger: 'menu-item-red hover:text-red-600 hover:bg-red-600/10 hover:border-red-600',
        green: 'menu-item-green hover:text-green-600 hover:bg-green-600/10 hover:border-green-600',
        emerald:
            'menu-item-emerald hover:text-emerald-600 hover:bg-emerald-600/10 hover:border-emerald-600',
        black: 'menu-item-black hover:text-black-600 hover:bg-black-600/10 hover:border-black-600',
    }

    return (
        <Link
            className={clsx(
                'menu-item',
                'text-sm text-nowrap',
                'w-full flex items-center text-gray-500 p-2',
                'border border-gray-200',
                isFirst &&
                    !isSingle &&
                    'rounded-bl-2xl rounded-tl-2xl lg:rounded-bl-none lg:rounded-tr-2xl',
                isLast &&
                    !isSingle &&
                    'border-r-1 lg:border-b-1 rounded-br-2xl rounded-tr-2xl lg:rounded-br-2xl lg:rounded-bl-2xl lg:rounded-tr-none',
                isSingle && 'rounded-2xl border-r-1 lg:border-b-1',
                'border-r-0 lg:border-r-1 lg:border-b-0',
                colorStyles[color],
                'transition-colors'
            )}
            href={href}
        >
            <Icon className="size-4 mr-3" /> {title}
        </Link>
    )
}
