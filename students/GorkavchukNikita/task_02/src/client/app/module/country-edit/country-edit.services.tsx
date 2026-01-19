import { useState } from 'react'

import { ICountry } from '@/app/shared/interface'

export const useCountryEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)

    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
    }

    const selectCountry = (country: ICountry) => {
        setSelectedCountry(country)
        setOpenEditModal(true)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const refreshTable = () => {
        setRefreshToken((prev) => prev + 1)
    }

    const handleOpenDeleteModal = (country: ICountry) => {
        setSelectedCountry(country)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
    }

    return {
        openCreateModal,
        openEditModal,
        openDeleteModal,
        selectedCountry,
        refreshToken,
        handleOpenCreateModal,
        handleCloseCreateModal,
        selectCountry,
        handleCloseEditModal,
        refreshTable,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    }
}
