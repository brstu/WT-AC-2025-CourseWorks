import { useState } from 'react'

export const useSpeakerSevices = () => {
    const [showContacts, setShowContacts] = useState(false)

    const toggleContactsView = () => {
        setShowContacts((prev) => !prev)
    }

    return {
        showContacts,
        toggleContactsView,
    }
}
