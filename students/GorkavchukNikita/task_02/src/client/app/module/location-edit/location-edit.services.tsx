import { useState } from 'react'

import { ILocation } from '@/app/shared/interface'

export const useLocationEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedLocation, setSelectedLocation] = useState<ILocation | null>(null)

    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
    }

    const selectLocation = (location: ILocation) => {
        setSelectedLocation(location)
        setOpenEditModal(true)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const refreshTable = () => {
        setRefreshToken((prev) => prev + 1)
    }

    const handleOpenDeleteModal = (location: ILocation) => {
        setSelectedLocation(location)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
    }

    return {
        openCreateModal,
        openEditModal,
        openDeleteModal,
        selectedLocation,
        refreshToken,
        handleOpenCreateModal,
        handleCloseCreateModal,
        selectLocation,
        handleCloseEditModal,
        refreshTable,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    }
}
