'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { IInvitation } from '@/app/shared/interface'
import { InvitationCard } from './element/invitation-card'
import { useInvititationsModuleServices } from './invitations.services'
import { Button } from '@/app/shared/component/button'

interface IProps {
    invitations: IInvitation[]
}

export const InvitationsModule = ({ invitations }: IProps) => {
    const thisService = useInvititationsModuleServices({ invitations })

    return (
        <div className="max-w-3xl m-auto py-10 px-2">
            <div className="flex gap-2 mb-4">
                <Link href={`/`}>
                    <Button variant="ghost" startIcon={ArrowLeft}>
                        Back
                    </Button>
                </Link>
            </div>

            {thisService.invitationsList.length === 0 ? (
                <div className="text-center">
                    <h3 className="font-bold text-2xl">No Invitations</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mx-auto">
                    {thisService.invitationsList.map((item) => (
                        <InvitationCard
                            key={item._id}
                            invitation={item}
                            onDecision={() => thisService.removeInvitation(item._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
