'use client'

import { useUsersTable } from './users-table.services'
import { ErrorComponent } from '@/app/shared/component/error'
import { Button } from '@/app/shared/component/button'
import { IUserAdmin } from '@/app/shared/interface'

interface UsersTableProps {
    onRowClick?: (user: IUserAdmin) => void
    onDeleteClick?: (user: IUserAdmin) => void
    onResetPasswordClick?: (user: IUserAdmin) => void
    refreshToken: number
}

export const UsersTableComponent = ({
    onRowClick,
    onDeleteClick,
    onResetPasswordClick,
    refreshToken,
}: UsersTableProps) => {
    const { users, page, totalPages, isLoading, error, goPrev, goNext, goToPage } = useUsersTable({
        refreshToken,
    })

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Users Loading...</div>
    }

    if (error) {
        return (
            <div className="py-8">
                <ErrorComponent>{error}</ErrorComponent>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Role</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Created At</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Updated At</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user._id}
                                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onRowClick?.(user)}
                            >
                                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{user.role}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {new Date(user.createdAt).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {new Date(user.updatedAt).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs flex flex-col gap-2">
                                    <Button
                                        variant="soft"
                                        color="danger"
                                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                            event.stopPropagation()
                                            onDeleteClick?.(user)
                                        }}
                                    >
                                        Delete
                                    </Button>

                                    <Button
                                        variant="soft"
                                        color="amber"
                                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                            event.stopPropagation()
                                            onResetPasswordClick?.(user)
                                        }}
                                    >
                                        Reset Password
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {users.length === 0 && !isLoading && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-gray-400 text-sm"
                                >
                                    No Users
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                    Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={page === 1}
                        className="px-3 py-1 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, index) => {
                            const pageNumber = index + 1
                            return (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => goToPage(pageNumber)}
                                    className={`px-2.5 py-1 text-xs rounded-lg border ${
                                        pageNumber === page
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            )
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={goNext}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
