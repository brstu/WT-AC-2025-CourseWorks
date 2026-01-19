'use client'

import { Plus } from 'lucide-react'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'

import { useOrderEditServices } from './order-edit.services'
import { OrdersTableComponent } from './element/orders-list'
import { CreateOrderModal } from './element/create-order-modal'
import { DeleteOrderModal } from './element/delete-order-modal'
import { OrderDrawer } from './element/order-drawer'

export const OrderEditModule = () => {
    const thisService = useOrderEditServices()

    const handleAfterCreateChange = () => {
        thisService.refreshTable()
        thisService.handleCloseCreateModal()
    }

    const handleAfterDeleteChange = () => {
        thisService.refreshTable()
        thisService.handleCloseDeleteModal()
    }

    const handleAfterOrderUpdated = () => {
        thisService.refreshTable()
    }

    return (
        <WrapperComponent className="py-10">
            <div className="mb-6">
                <Button onClick={() => thisService.handleOpenCreateModal()} startIcon={Plus}>
                    Create Order
                </Button>
            </div>

            <OrdersTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(order) => thisService.handleOpenDrawer(order)}
                onDeleteClick={(order) => thisService.handleOpenDeleteModal(order)}
            />

            <CreateOrderModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <DeleteOrderModal
                open={thisService.openDeleteModal}
                selectedOrder={thisService.selectedOrder}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />

            <OrderDrawer
                open={thisService.openDrawer}
                orderId={thisService.selectedOrder?._id || null}
                onClose={() => thisService.handleCloseDrawer()}
                onOrderUpdated={handleAfterOrderUpdated}
            />
        </WrapperComponent>
    )
}
