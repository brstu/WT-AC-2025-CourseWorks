'use client'

import clsx from 'clsx'
import { SpeakerItem } from '../speaker-item'
import { useSpeakersPagination } from './speaker-list.services'
import { IEventAdmin, IEventSpeaker } from '@/app/shared/interface'

interface IProps {
    selectedSpeakers: IEventAdmin['speakers']
    addSpeaker?: (speaker: IEventSpeaker) => void
    removeSpeaker?: (speakerId: string) => void
}

export const SpeakersList = ({ addSpeaker, selectedSpeakers }: IProps) => {
    const { speakers, currentPage, totalPages, isLoading, error, goToPage, goNext, goPrev } =
        useSpeakersPagination()

    if (isLoading && speakers.length === 0) {
        return <div>Loading...</div>
    }

    if (error && speakers.length === 0) {
        return <div className="text-red-500">Error: {error}</div>
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {speakers.map((speaker) => {
                    const isSelected = selectedSpeakers?.some((s) => s._id === speaker._id)

                    return (
                        <div
                            key={speaker._id}
                            className={clsx(
                                'relative',
                                isSelected ? 'opacity-40 select-none' : 'cursor-pointer'
                            )}
                            onClick={() => addSpeaker?.(speaker)}
                        >
                            <SpeakerItem speaker={speaker} />
                        </div>
                    )
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                    >
                        Back
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 border rounded text-sm ${
                                page === currentPage
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-black'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={goNext}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded disabled:opacity-50 text-sm"
                    >
                        Forward
                    </button>
                </div>
            )}
        </div>
    )
}
