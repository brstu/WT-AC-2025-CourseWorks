import { useState } from 'react'

import { ICity } from '@/app/shared/interface'

export const useCityEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedCity, setSelectedCity] = useState<ICity | null>(null)

    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
    }

    const selectCity = (city: ICity) => {
        setSelectedCity(city)
        setOpenEditModal(true)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const refreshTable = () => {
        setRefreshToken((prev) => prev + 1)
    }

    const handleOpenDeleteModal = (city: ICity) => {
        setSelectedCity(city)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
    }

    return {
        openCreateModal,
        openEditModal,
        openDeleteModal,
        selectedCity,
        refreshToken,
        handleOpenCreateModal,
        handleCloseCreateModal,
        selectCity,
        handleCloseEditModal,
        refreshTable,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    }
}
