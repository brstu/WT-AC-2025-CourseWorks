'use client'

import { Plus } from 'lucide-react'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'

import { CountriesTableComponent } from './element/countries-list'
import { CreateCountryModal } from './element/create-country-modal'
import { EditCountryModal } from './element/edit-country-modal'
import { DeleteCountryModal } from './element/delete-country-modal'

import { useCountryEditServices } from './country-edit.services'

export const CountryEditModule = () => {
    const thisService = useCountryEditServices()

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
                    Create Country
                </Button>
            </div>

            <CountriesTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(country) => thisService.selectCountry(country)}
                onDeleteClick={(country) => thisService.handleOpenDeleteModal(country)}
            />

            <CreateCountryModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <EditCountryModal
                open={thisService.openEditModal}
                selectedCountry={thisService.selectedCountry}
                onClose={() => thisService.handleCloseEditModal()}
                onSuccess={handleAfterEditChange}
            />

            <DeleteCountryModal
                open={thisService.openDeleteModal}
                selectedCountry={thisService.selectedCountry}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />
        </WrapperComponent>
    )
}
