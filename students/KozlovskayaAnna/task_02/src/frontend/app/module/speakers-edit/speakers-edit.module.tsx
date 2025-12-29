'use client'

import { Plus } from 'lucide-react'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { SpeakersTableComponent } from './element/speakers-list'
import { CreateSpeakerModal } from './element/create-speaker-modal'
import { EditSpeakerModal } from './element/edit-speaker-modal'
import { DeleteSpeakerModal } from './element/delete-speaker-modal'
import { Button } from '@/app/shared/component/button'
import { useSpeakersEditServices } from './speakers-edit.services'

export const SpeakersEditModule = () => {
    const thisService = useSpeakersEditServices()

    const handleAfterEditChange = () => {
        thisService.refreshTable()
        thisService.handleCloseEditModal()
    }

    const handleAfterCreateChange = () => {
        thisService.refreshTable()
        thisService.handleCloseCreateModal()
    }

    const handleAfterDeleteChange = () => {
        thisService.refreshTable()
        thisService.handleCloseDeleteModal()
    }

    return (
        <WrapperComponent className="py-10">
            <div className="mb-6">
                <Button onClick={() => thisService.handleOpenCreateModal()} startIcon={Plus}>
                    Create Speaker
                </Button>
            </div>

            <SpeakersTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(speaker) => thisService.selectSpeaker(speaker)}
                onDeleteClick={(speaker) => thisService.handleOpenDeleteModal(speaker)}
            />

            <CreateSpeakerModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <EditSpeakerModal
                open={thisService.openEditModal}
                selectedSpeaker={thisService.selectedSpeaker}
                onClose={() => thisService.handleCloseEditModal()}
                onSuccess={handleAfterEditChange}
            />

            <DeleteSpeakerModal
                open={thisService.openDeleteModal}
                selectedSpeaker={thisService.selectedSpeaker}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />
        </WrapperComponent>
    )
}
