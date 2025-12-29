'use client'

import { Plus } from 'lucide-react'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { UsersTableComponent } from './element/users-list/'
import { CreateUserModal } from './element/create-user-modal'
import { EditUserModal } from './element/edit-user-modal/'
import { DeleteUserModal } from './element/delete-user-modal'
import { Button } from '@/app/shared/component/button'
import { useUserEditServices } from './user-edit.services'
import { ResetPasswordModal } from './element/reset-password-modal'

export const UserEditModule = () => {
    const thisService = useUserEditServices()

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

    const handleAfterResetPasswordChange = () => {
        thisService.refreshTable()
        thisService.handleCloseResetPasswordModal()
    }

    return (
        <WrapperComponent className="py-10">
            <div className="mb-6">
                <Button onClick={() => thisService.handleOpenCreateModal()} startIcon={Plus}>
                    Create User
                </Button>
            </div>

            <UsersTableComponent
                refreshToken={thisService.refreshToken}
                onRowClick={(user) => thisService.selectUser(user)}
                onDeleteClick={(user) => thisService.handleOpenDeleteModal(user)}
                onResetPasswordClick={(user) => thisService.handleOpenResetPasswordModal(user)}
            />

            <CreateUserModal
                open={thisService.openCreateModal}
                onClose={() => thisService.handleCloseCreateModal()}
                onSuccess={handleAfterCreateChange}
            />

            <EditUserModal
                open={thisService.openEditModal}
                selectedUser={thisService.selectedUser}
                onClose={() => thisService.handleCloseEditModal()}
                onSuccess={handleAfterEditChange}
            />

            <DeleteUserModal
                open={thisService.openDeleteModal}
                selectedUser={thisService.selectedUser}
                onClose={() => thisService.handleCloseDeleteModal()}
                onSuccess={handleAfterDeleteChange}
            />

            <ResetPasswordModal
                open={thisService.openResetPasswordModal}
                selectedUser={thisService.selectedUser}
                onClose={() => thisService.handleCloseResetPasswordModal()}
                onSuccess={handleAfterResetPasswordChange}
            />
        </WrapperComponent>
    )
}
