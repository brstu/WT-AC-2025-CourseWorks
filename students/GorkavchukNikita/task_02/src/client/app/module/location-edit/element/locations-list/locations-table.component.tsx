'use client'

import React from 'react'

import { useLocationsTable } from './locations-table.services'
import { ErrorComponent } from '@/app/shared/component/error'
import { Button } from '@/app/shared/component/button'
import { ILocation } from '@/app/shared/interface'

interface LocationsTableProps {
    onRowClick?: (location: ILocation) => void
    onDeleteClick?: (location: ILocation) => void
    refreshToken: number
}

const LOCATION_TYPE_LABELS: Record<number, string> = {
    0: 'warehouse',
    1: 'sort_center',
    2: 'pickup_point',
    3: 'locker',
    4: 'hub',
}

const getCityAndCountryText = (location: ILocation) => {
    const rawCity: any = location.cityId as any

    // When backend returns ObjectId string
    if (!rawCity || typeof rawCity === 'string') {
        return {
            city: typeof rawCity === 'string' ? rawCity : '-',
            country: '-',
        }
    }

    const city = `${rawCity.name ?? ''}${rawCity.cityCode ? ` (${rawCity.cityCode})` : ''}`.trim()

    const rawCountry: any = rawCity.countryId
    const country =
        rawCountry && typeof rawCountry === 'object'
            ? `${rawCountry.name ?? ''}${rawCountry.countryCode ? ` (${rawCountry.countryCode})` : ''}`.trim()
            : '-'

    return {
        city: city || '-',
        country: country || '-',
    }
}

export const LocationsTableComponent = ({
    onRowClick,
    onDeleteClick,
    refreshToken,
}: LocationsTableProps) => {
    const { locations, page, totalPages, isLoading, error, goPrev, goNext, goToPage } =
        useLocationsTable({
            refreshToken,
        })

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Locations Loading...</div>
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
                            <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Label</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Location code</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Country</th>
                            <th className="px-4 py-3 font-medium text-gray-500">City</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Postal code</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Street</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((location) => {
                            const { city, country } = getCityAndCountryText(location)

                            return (
                                <tr
                                    key={location._id}
                                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onRowClick?.(location)}
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {LOCATION_TYPE_LABELS[location.type] ?? String(location.type)}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {location.label}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {location.locationCode}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{country}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{city}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {location.postalCode}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {location.street}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                event.stopPropagation()
                                                onDeleteClick?.(location)
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}

                        {locations.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No Locations
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
