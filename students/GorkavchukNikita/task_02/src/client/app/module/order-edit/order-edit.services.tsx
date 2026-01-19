'use client'

import { useState } from 'react'
import type { IOrderAdmin } from './order-edit.types'

export const useOrderEditServices = () => {
    const [openCreateModal, setOpenCreateModal] = useState(false)
    const [openDeleteModal, setOpenDeleteModal] = useState(false)
    const [openDrawer, setOpenDrawer] = useState(false)

    const [refreshToken, setRefreshToken] = useState(0)

    const [selectedOrder, setSelectedOrder] = useState<IOrderAdmin | null>(null)

    const refreshTable = () => setRefreshToken((prev) => prev + 1)

    const handleOpenCreateModal = () => setOpenCreateModal(true)
    const handleCloseCreateModal = () => setOpenCreateModal(false)

    const handleOpenDrawer = (order: IOrderAdmin) => {
        setSelectedOrder(order)
        setOpenDrawer(true)
    }

    const handleCloseDrawer = () => {
        setOpenDrawer(false)
    }

    const handleOpenDeleteModal = (order: IOrderAdmin) => {
        setSelectedOrder(order)
        setOpenDeleteModal(true)
    }

    const handleCloseDeleteModal = () => setOpenDeleteModal(false)

    return {
        openCreateModal,
        openDeleteModal,
        openDrawer,
        refreshToken,
        selectedOrder,
        refreshTable,
        handleOpenCreateModal,
        handleCloseCreateModal,
        handleOpenDrawer,
        handleCloseDrawer,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
    }
}
