'use client'

import { Plus } from 'lucide-react'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'

import { CitiesTableComponent } from './element/cities-list'
import { CreateCityModal } from './element/create-city-modal'
import { EditCityModal } from './element/edit-city-modal'
import { DeleteCityModal } from './element/delete-city-modal'

import { useCityEditServices } from './city-edit.services'

export const CityEditModule = () => {
    const thisService = useCityEditServices()

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
                    Create City
                </Button>
            </div>

            <CitiesTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(city) => thisService.selectCity(city)}
                onDeleteClick={(city) => thisService.handleOpenDeleteModal(city)}
            />

            <CreateCityModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <EditCityModal
                open={thisService.openEditModal}
                selectedCity={thisService.selectedCity}
                onClose={() => thisService.handleCloseEditModal()}
                onSuccess={handleAfterEditChange}
            />

            <DeleteCityModal
                open={thisService.openDeleteModal}
                selectedCity={thisService.selectedCity}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />
        </WrapperComponent>
    )
}
