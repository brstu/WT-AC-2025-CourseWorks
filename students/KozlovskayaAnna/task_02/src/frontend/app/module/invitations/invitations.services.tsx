import { useState } from 'react'
import { IInvitation } from '@/app/shared/interface'

interface IProps {
    invitations: IInvitation[]
}

export const useInvititationsModuleServices = ({ invitations }: IProps) => {
    const [invitationsList, setInvitationsList] = useState<IInvitation[]>(invitations)

    const removeInvitation = (id: string) => {
        setInvitationsList((prev) => prev.filter((item) => item._id !== id))
    }

    return {
        invitationsList,
        removeInvitation,
    }
}
