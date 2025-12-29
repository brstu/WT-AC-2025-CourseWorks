import { useState } from 'react'
import { ISpeaker } from '@/app/shared/interface'

export const useSpeakersEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedSpeaker, setSelectedSpeaker] = useState<ISpeaker | null>(null)

    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
    }

    const selectSpeaker = (speaker: ISpeaker) => {
        setSelectedSpeaker(speaker)
        setOpenEditModal(true)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const refreshTable = () => {
        setRefreshToken((prev) => prev + 1)
    }

    const handleOpenDeleteModal = (speaker: ISpeaker) => {
        setSelectedSpeaker(speaker)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
    }

    return {
        openCreateModal,
        openEditModal,
        openDeleteModal,
        selectedSpeaker,
        refreshToken,
        handleOpenCreateModal,
        handleCloseCreateModal,
        selectSpeaker,
        handleCloseEditModal,
        refreshTable,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    }
}
