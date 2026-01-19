import type { TEventStatus, TOrderStatus } from './order-edit.types'

export const ORDER_STATUS_OPTIONS: Array<{ value: TOrderStatus; label: string }> = [
    { value: 0, label: 'created' },
    { value: 1, label: 'shipped' },
    { value: 2, label: 'delivered' },
    { value: 3, label: 'at_pickup_point' },
    { value: 5, label: 'returned' },
]

export const EVENT_STATUS_OPTIONS: Array<{ value: TEventStatus; label: string }> = [
    { value: 0, label: 'created' },
    { value: 1, label: 'shipped' },
    { value: 2, label: 'in_transit' },
    { value: 3, label: 'out_for_delivery' },
    { value: 4, label: 'delivered' },
    { value: 5, label: 'at_pickup_point' },
    { value: 6, label: 'returned' },
]

export const ORDER_STATUS_LABELS = Object.fromEntries(
    ORDER_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<number, string>

export const EVENT_STATUS_LABELS = Object.fromEntries(
    EVENT_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
) as Record<number, string>
