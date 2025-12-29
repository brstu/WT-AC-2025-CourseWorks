import Image from 'next/image'
import { IInvitation } from '@/app/shared/interface'
import { Button } from '@/app/shared/component/button'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'
import { useInvitationsCardServices } from './invitations-card.services'

interface IProps {
    invitation: IInvitation
    onDecision?: () => void
}

export const InvitationCard = ({ invitation, onDecision }: IProps) => {
    const thisService = useInvitationsCardServices({ invitation, onDecision })

    return (
        <div className="flex border border-gray-200 rounded-[14px] overflow-hidden">
            <div className="bg-gray-600 w-[100px] h-[180px] flex-none">
                <Image
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    width={100}
                    height={180}
                    src={`${PUBLIC_URLS.imagesEvents}/${invitation.event.cover.name}`}
                    alt={invitation.event.cover.alt || ''}
                />
            </div>
            <div className="p-2 flex flex-col">
                <h3 className="font-bold text-xl">{invitation.event.title}</h3>

                <p className="text-gray-500 mt-2">Ivited By: {invitation.invited_by.name}</p>

                <div className="mt-auto flex gap-3">
                    <Button
                        color="emerald"
                        onClick={() => thisService.handleAcceptInvite()}
                        isSubmiting={thisService.loading}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="soft"
                        color="danger"
                        onClick={() => thisService.handleDeclineInvite()}
                        isSubmiting={thisService.loading}
                    >
                        Decline
                    </Button>
                </div>
            </div>
        </div>
    )
}
