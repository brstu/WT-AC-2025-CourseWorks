import { useState } from 'react'
import { IUserAdmin } from '@/app/shared/interface'

export const useUserEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState<boolean>(false)
    const [openEditModal, setOpenEditModal] = useState<boolean>(false)
    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false)
    const [openResetPasswordModal, setOpenResetPasswordModal] = useState<boolean>(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedUser, setSelectedUser] = useState<IUserAdmin | null>(null)

    const handleOpenCreateModal = () => {
        setOpenCreateModal(true)
    }

    const handleCloseCreateModal = () => {
        setOpenCreateModal(false)
    }

    const selectUser = (user: IUserAdmin) => {
        setSelectedUser(user)
        setOpenEditModal(true)
    }

    const handleCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const refreshTable = () => {
        setRefreshToken((prev) => prev + 1)
    }

    const handleOpenDeleteModal = (user: IUserAdmin) => {
        setSelectedUser(user)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setOpenDeleteModal(false)
    }

    const handleOpenResetPasswordModal = (user: IUserAdmin) => {
        setSelectedUser(user)
        setOpenResetPasswordModal(true)
    }

    const handleCloseResetPasswordModal = () => {
        setOpenResetPasswordModal(false)
    }

    return {
        openCreateModal,
        openEditModal,
        openDeleteModal,
        openResetPasswordModal,
        selectedUser,
        refreshToken,
        handleOpenCreateModal,
        handleCloseCreateModal,
        selectUser,
        handleCloseEditModal,
        refreshTable,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleOpenResetPasswordModal,
        handleCloseResetPasswordModal,
    }
}
