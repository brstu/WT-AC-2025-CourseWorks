'use client'

import { ErrorComponent } from '@/app/shared/component/error'
import { Button } from '@/app/shared/component/button'
import { ICity } from '@/app/shared/interface'

import { useCitiesTable } from './cities-table.services'

interface IProps {
    onRowClick?: (city: ICity) => void
    onDeleteClick?: (city: ICity) => void
    refreshToken: number
}

export const CitiesTableComponent = ({ onRowClick, onDeleteClick, refreshToken }: IProps) => {
    const { cities, page, totalPages, isLoading, error, goPrev, goNext, goToPage, getCityCountry } =
        useCitiesTable({ refreshToken })

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Cities Loading...</div>
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
                            <th className="px-4 py-3 font-medium text-gray-500">City code</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Country</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.map((city) => {
                            const country = getCityCountry(city)
                            return (
                                <tr
                                    key={city._id}
                                    className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onRowClick?.(city)}
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {city.name}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {city.cityCode}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {country ? `${country.name} (${country.countryCode})` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                event.stopPropagation()
                                                onDeleteClick?.(city)
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            )
                        })}

                        {cities.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                                    No Cities
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
