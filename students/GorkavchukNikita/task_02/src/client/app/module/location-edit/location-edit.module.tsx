'use client'

import { Plus } from 'lucide-react'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'

import { LocationsTableComponent } from './element/locations-list'
import { CreateLocationModal } from './element/create-location-modal'
import { EditLocationModal } from './element/edit-location-modal'
import { DeleteLocationModal } from './element/delete-location-modal'

import { useLocationEditServices } from './location-edit.services'

export const LocationEditModule = () => {
    const thisService = useLocationEditServices()

    const handleAfterCreateChange = () => {
        thisService.refreshTable()
        thisService.handleCloseCreateModal()
    }

    const handleAfterEditChange = () => {
        thisService.refreshTable()
        thisService.handleCloseEditModal()
    }

    const handleAfterDeleteChange = () => {
        thisService.refreshTable()
        thisService.handleCloseDeleteModal()
    }

    return (
        <WrapperComponent className="py-10">
            <div className="mb-6">
                <Button onClick={() => thisService.handleOpenCreateModal()} startIcon={Plus}>
                    Create Location
                </Button>
            </div>

            <LocationsTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(location) => thisService.selectLocation(location)}
                onDeleteClick={(location) => thisService.handleOpenDeleteModal(location)}
            />

            <CreateLocationModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <EditLocationModal
                open={thisService.openEditModal}
                selectedLocation={thisService.selectedLocation}
                onClose={() => thisService.handleCloseEditModal()}
                onSuccess={handleAfterEditChange}
            />

            <DeleteLocationModal
                open={thisService.openDeleteModal}
                selectedLocation={thisService.selectedLocation}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />
        </WrapperComponent>
    )
}
