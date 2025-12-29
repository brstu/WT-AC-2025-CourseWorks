import { useState } from 'react'
import { COMMON_ERRORS } from '@/app/constants/errors'
import { EResponseStatus, IInvitation } from '@/app/shared/interface'

interface IProps {
    invitation: IInvitation
    onDecision?: () => void
}

export const useInvitationsCardServices = ({ invitation, onDecision }: IProps) => {
    const hostUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const handleAcceptInvite = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(
                `${hostUrl}/events/${invitation.event._id}/invite/accept`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify({
                        invitation_id: invitation._id,
                    }),
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            onDecision?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            console.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeclineInvite = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(
                `${hostUrl}/events/${invitation.event._id}/invite/decline`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify({
                        invitation_id: invitation._id,
                    }),
                }
            )
            const json = await response.json()

            if (json.status === EResponseStatus.error) {
                throw new Error(json.message)
            }

            onDecision?.()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

            setError(message)
            console.error(message)
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        handleAcceptInvite,
        handleDeclineInvite,
    }
}
