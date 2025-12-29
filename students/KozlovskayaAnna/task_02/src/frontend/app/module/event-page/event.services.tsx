import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventStoreContext } from '@/app/shared/providers'
import { useUserStore } from '@/app/shared/store'
import { useJoinToEventHook, useUnregisterFromEventHook } from '@/app/shared/hooks/'

export const useEventServices = () => {
    const router = useRouter()

    const event = useEventStoreContext((state) => state.event)
    const setAtendee = useEventStoreContext((state) => state.setAtendee)
    const clearAtendee = useEventStoreContext((state) => state.clearAtendee)
    const user = useUserStore((state) => state.user)

    const [openInviteModal, setOpenInviteModal] = useState(false)

    const { joinEvent, joinPending, error: joinError } = useJoinToEventHook(event?._id || '')
    const {
        unregisterEvent,
        unregisterPending,
        error: unregisterError,
    } = useUnregisterFromEventHook(event?._id || '')

    const handleJoin = async () => {
        if (!user) {
            router.replace('/login')
            return
        }

        const data = await joinEvent()
        setAtendee(data.atendee)
    }

    const handleUnregister = async () => {
        if (!user) {
            router.replace('/login')
            return
        }

        await unregisterEvent()
        clearAtendee()
    }

    const handleOpenInviteModal = () => {
        setOpenInviteModal(true)
    }

    const handleCloseInviteModal = () => {
        setOpenInviteModal(false)
    }

    return {
        event,
        handleJoin,
        joinPending,
        joinError,
        handleUnregister,
        unregisterPending,
        unregisterError,
        openInviteModal,
        handleOpenInviteModal,
        handleCloseInviteModal,
    }
}
