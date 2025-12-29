'use client'

import Image from 'next/image'
import { useSpeakersTable } from './speakers-table.services'
import { ErrorComponent } from '@/app/shared/component/error'
import { ISpeaker } from '@/app/shared/interface'
import { Button } from '@/app/shared/component/button'
import { PUBLIC_URLS } from '@/app/constants/public-aws-urls'

interface SpeakersTableProps {
    onRowClick?: (speaker: ISpeaker) => void
    onDeleteClick?: (speaker: ISpeaker) => void
    refreshToken: number
}

export const SpeakersTableComponent = ({
    onRowClick,
    onDeleteClick,
    refreshToken,
}: SpeakersTableProps) => {
    const { speakers, page, totalPages, isLoading, error, goPrev, goNext, goToPage } =
        useSpeakersTable({ refreshToken })

    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Speakers Loading...</div>
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
                            <th className="px-4 py-3 font-medium text-gray-500">Cover</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Contacts</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Bio</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Created At</th>
                            <th className="px-4 py-3 font-medium text-gray-500">Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {speakers.map((speaker) => (
                            <tr
                                key={speaker._id}
                                className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onRowClick?.(speaker)}
                            >
                                <td className="px-4 py-3">
                                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100 relative">
                                        <Image
                                            // src="/speaker-test.jpg"
                                            src={`${PUBLIC_URLS.imagesSpeakers}/${speaker.photo.name}`}
                                            alt={speaker.photo.alt || speaker.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {speaker.name}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    <div className="flex flex-col gap-1">
                                        {speaker.contacts.telegram && (
                                            <span className="text-xs">
                                                TG:{' '}
                                                <span className="font-medium">
                                                    {speaker.contacts.telegram}
                                                </span>
                                            </span>
                                        )}
                                        {speaker.contacts.email && (
                                            <span className="text-xs">
                                                Email:{' '}
                                                <span className="font-medium">
                                                    {speaker.contacts.email}
                                                </span>
                                            </span>
                                        )}
                                        {speaker.contacts.phone && (
                                            <span className="text-xs">
                                                Phone:{' '}
                                                <span className="font-medium">
                                                    {speaker.contacts.phone}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 max-w-xs">
                                    <p className="line-clamp-2 text-xs">{speaker.bio}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {new Date(speaker.createdAt).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    <Button
                                        variant="soft"
                                        color="danger"
                                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                            event.stopPropagation()
                                            onDeleteClick?.(speaker)
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {speakers.length === 0 && !isLoading && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-6 text-center text-gray-400 text-sm"
                                >
                                    No Speakers
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
