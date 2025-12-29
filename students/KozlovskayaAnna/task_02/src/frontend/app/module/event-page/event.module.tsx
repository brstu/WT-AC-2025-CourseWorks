'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Undo2 } from 'lucide-react'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'

import { useEventServices } from './event.services'
import { ContentComponent } from './element/content'
import { InfoComponent } from './element/info'
import { InviteModal } from './element/invite-modal'

import { USER_ROLES } from '@/app/constants/user-roles'
import { useGetUserRole } from '@/app/shared/hooks/'

import './styles/event-content.css'

interface ModuleProps {
    initialRole?: string
}

export const EventPageModule = ({ initialRole }: ModuleProps) => {
    const thisService = useEventServices()
    const { getUserRole } = useGetUserRole()

    const [role, setRole] = useState<string>(initialRole || USER_ROLES.USER)

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

    if (!thisService.event) {
        return (
            <WrapperComponent className="py-10">
                <h3 className="text-center text-2xl font-bold">This event does not exist</h3>
                <div className="text-center mt-2.5">
                    <Link href="/" className="inline-block">
                        <Button startIcon={Undo2} variant="ghost">
                            Go Home
                        </Button>
                    </Link>
                </div>
            </WrapperComponent>
        )
    }

    return (
        <WrapperComponent className="grid grid-cols-1 md:grid-cols-[240px_1fr] py-7 gap-x-5">
            <InfoComponent
                role={role}
                handleJoin={() => thisService.handleJoin()}
                joinError={thisService.joinError}
                joinPending={thisService.joinPending}
                handleUnregister={() => thisService.handleUnregister()}
                unregisterError={thisService.unregisterError}
                unregisterPending={thisService.unregisterPending}
                handleOpenInviteModal={() => thisService.handleOpenInviteModal()}
            />
            <ContentComponent />

            <InviteModal
                open={thisService.openInviteModal}
                onClose={() => thisService.handleCloseInviteModal()}
            />
        </WrapperComponent>
    )
}
