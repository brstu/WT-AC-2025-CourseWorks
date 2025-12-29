import {
    // CalendarMinus2,
    CircleUserRound,
    Edit3,
    LucideIcon,
    MailPlus,
    Tickets,
    UsersRound,
} from 'lucide-react'
import { LinkColor } from './element/menu-item/'

type ItemConfig = {
    fieldName: string
    icon: LucideIcon
    color: LinkColor
    href: string
}

type LinksConfig = {
    isAdmin?: boolean
    items: ItemConfig[]
}

export const links: LinksConfig[] = [
    {
        items: [
            {
                fieldName: 'Invitations',
                icon: MailPlus,
                color: 'green',
                href: '/invitations',
            },
            {
                fieldName: 'Tickets',
                icon: Tickets,
                color: 'indigo',
                href: '/tickets',
            },
            // {
            //     fieldName: 'Events',
            //     icon: CalendarMinus2,
            //     color: 'amber',
            //     href: '/',
            // },
        ],
    },
    {
        isAdmin: true,
        items: [
            {
                fieldName: 'Create Event',
                icon: Edit3,
                color: 'violet',
                href: '/admin/events/create',
            },
            {
                fieldName: 'Edit Speakers',
                icon: CircleUserRound,
                color: 'violet',
                href: '/admin/speakers',
            },
            {
                fieldName: 'Edit Users',
                icon: UsersRound,
                color: 'violet',
                href: '/admin/users',
            },
        ],
    },
]
