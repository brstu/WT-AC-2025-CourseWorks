'use client'

import React from 'react'

import { ErrorComponent } from '@/app/shared/component/error'
import { Button } from '@/app/shared/component/button'

import { useOrdersTable } from './orders-table.services'
import type { IOrderAdmin } from '../../order-edit.types'
import { ORDER_STATUS_LABELS, EVENT_STATUS_LABELS } from '../../order-edit.constants'
import { formatDateTime, formatLocation } from '../../order-edit.utils'

interface IProps {
    onRowClick?: (order: IOrderAdmin) => void
    onDeleteClick?: (order: IOrderAdmin) => void
    refreshToken: number
}

export const OrdersTableComponent = ({ onRowClick, onDeleteClick, refreshToken }: IProps) => {
    const { orders, page, totalPages, isLoading, error, goPrev, goNext, goToPage } =
        useOrdersTable({ refreshToken })

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Orders Loading...</div>
    }

    if (error) {
        return (
            <div className="py-8">
                <ErrorComponent>{error}</ErrorComponent>
            </div>
        )
    }

    const renderOrderStatus = (status: number) => {
        const os = ORDER_STATUS_LABELS[status]
        const es = EVENT_STATUS_LABELS[status]

        if (os && es && os === es) return `${os} (${status})`
        if (os && es && os !== es) return `${os} (${status}) • ES: ${es}`
        if (os) return `${os} (${status})`
        if (es) return `${es} (${status})`
        return String(status)
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 font-medium text-gray-500">Code</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Pickup</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Current</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Created</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Updated</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Controls</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order._id}
                                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onRowClick?.(order)}
                            >
                                <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                    {order.orderCode}
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">{order.name}</td>
                                <td className="px-4 py-3 text-gray-900">
                                    {renderOrderStatus(order.status)}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {formatLocation(order.pickupLocation)}
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    {formatLocation(order.currentLocation)}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {formatDateTime(order.createdAt)}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {formatDateTime(order.updatedAt)}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                event.stopPropagation()
                                                onDeleteClick?.(order)
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {orders.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No Orders
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
