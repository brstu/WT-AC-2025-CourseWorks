'use client'

import clsx from 'clsx'
import { Field, Input } from '@headlessui/react'
import { PackageSearch, MapPin, Hash, CalendarClock, Route, Info } from 'lucide-react'

import { ErrorComponent } from '@/app/shared/component/error'
import { Button } from '@/app/shared/component/button'

import {
    ORDER_STATUS_LABELS,
    EVENT_STATUS_LABELS,
} from '@/app/module/order-edit/order-edit.constants'
import { formatDateTime, formatLocation } from '@/app/module/order-edit/order-edit.utils'

import { useOrderTrackerServices } from './order-tracker.services'
import { getStatusBadgeClass, humanizeSnakeCase } from './order-tracker.utils'

const StatusBadge = ({ label }: { label: string }) => {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
                getStatusBadgeClass(label)
            )}
        >
            {humanizeSnakeCase(label) || 'Unknown'}
        </span>
    )
}

export const OrderTracker = () => {
    const thisService = useOrderTrackerServices()

    const orderStatusLabel = thisService.order
        ? ORDER_STATUS_LABELS[thisService.order.status] || String(thisService.order.status)
        : ''

    return (
        <div className="mx-auto max-w-3xl w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Track your parcel</h1>
                <p className="text-gray-600 mt-2">
                    Enter the tracking code to see the current status and delivery timeline.
                </p>
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    thisService.submit()
                }}
                className="flex flex-col items-center"
            >
                <Field className="w-full">
                    <div className="relative">
                        <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-6 text-gray-400" />

                        <Input
                            value={thisService.trackingCode}
                            onChange={(e) => thisService.setTrackingCode(e.target.value)}
                            disabled={thisService.isLoading}
                            placeholder="Enter tracking code"
                            className={clsx(
                                'w-full rounded-2xl border-2 border-gray-200 bg-slate-50',
                                'pl-12 pr-28 sm:pr-40',
                                'py-4 sm:py-5',
                                'min-h-[56px] sm:min-h-[64px]',
                                'text-base sm:text-lg md:text-2xl font-semibold tracking-wide',
                                'placeholder:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-300',
                                thisService.isLoading && 'opacity-60'
                            )}
                        />

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {thisService.trackingCode.trim() && !thisService.isLoading && (
                                <Button
                                    type="button"
                                    color="black"
                                    variant="soft"
                                    onClick={thisService.clear}
                                    className="px-3 py-3 rounded-xl"
                                >
                                    Clear
                                </Button>
                            )}

                            <Button
                                type="submit"
                                color="black"
                                isSubmiting={thisService.isLoading}
                                disabled={thisService.isLoading}
                                className="px-4 py-3 rounded-xl"
                            >
                                Track
                            </Button>
                        </div>
                    </div>
                </Field>

                {thisService.error && (
                    <ErrorComponent className="mt-4 w-full">{thisService.error}</ErrorComponent>
                )}
            </form>

            <div className="mt-10">
                {/* Skeleton */}
                {thisService.isLoading && !thisService.order && !thisService.error && (
                    <div className="border border-gray-200 rounded-2xl p-6 animate-pulse">
                        <div className="h-6 w-56 bg-gray-200 rounded" />
                        <div className="mt-4 h-4 w-full bg-gray-200 rounded" />
                        <div className="mt-2 h-4 w-5/6 bg-gray-200 rounded" />
                        <div className="mt-8 h-4 w-40 bg-gray-200 rounded" />
                        <div className="mt-2 h-4 w-full bg-gray-200 rounded" />
                        <div className="mt-2 h-4 w-11/12 bg-gray-200 rounded" />
                    </div>
                )}

                {/* Result */}
                {thisService.order && (
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Hash className="size-4" />
                                        <span className="text-sm font-semibold tracking-wider">
                                            {thisService.order.orderCode}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold mt-1">
                                        {thisService.order.name}
                                    </h2>
                                </div>

                                <StatusBadge label={orderStatusLabel} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                <div className="flex items-start gap-2">
                                    <MapPin className="size-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">Pickup location</div>
                                        <div className="text-sm font-medium">
                                            {formatLocation(thisService.order.pickupLocation)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Route className="size-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">
                                            Current location
                                        </div>
                                        <div className="text-sm font-medium">
                                            {formatLocation(thisService.order.currentLocation)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <CalendarClock className="size-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">Created</div>
                                        <div className="text-sm font-medium">
                                            {formatDateTime(thisService.order.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Info className="size-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">Last update</div>
                                        <div className="text-sm font-medium">
                                            {formatDateTime(thisService.order.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold">Timeline</h3>
                                <div className="text-sm text-gray-500">
                                    {thisService.events.length}{' '}
                                    {thisService.events.length === 1 ? 'event' : 'events'}
                                </div>
                            </div>

                            {thisService.events.length === 0 ? (
                                <div className="text-gray-500 mt-4">No events yet.</div>
                            ) : (
                                <ol className="mt-6">
                                    {thisService.events.map((ev, index) => {
                                        const label =
                                            EVENT_STATUS_LABELS[ev.status] || String(ev.status)
                                        const isLast = index === thisService.events.length - 1

                                        return (
                                            <li key={ev._id} className="relative pl-8 pb-6">
                                                {!isLast && (
                                                    <span className="absolute left-[15px] top-[23px] h-[64px] w-px bg-gray-200" />
                                                )}

                                                <span
                                                    className={clsx(
                                                        'absolute left-2.5 top-3 size-3 rounded-full border',
                                                        isLast
                                                            ? 'bg-foreground border-foreground'
                                                            : 'bg-white border-gray-300'
                                                    )}
                                                />

                                                <div className="flex flex-col gap-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <StatusBadge label={label} />
                                                        <span className="text-sm text-gray-500">
                                                            {formatDateTime(ev.createdAt)}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm font-medium">
                                                        {formatLocation(ev.location)}
                                                    </div>

                                                    {ev.description && (
                                                        <div className="text-sm text-gray-600">
                                                            {ev.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ol>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
