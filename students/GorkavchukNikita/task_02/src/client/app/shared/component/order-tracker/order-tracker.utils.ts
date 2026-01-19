export const humanizeSnakeCase = (value?: string | null) => {
    const raw = (value || '').trim()
    if (!raw) return ''

    return raw
        .split('_')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export const getStatusBadgeClass = (statusLabel: string) => {
    switch (statusLabel) {
        case 'created':
            return 'bg-gray-100 text-gray-700 border-gray-200'
        case 'shipped':
        case 'in_transit':
        case 'out_for_delivery':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200'
        case 'delivered':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200'
        case 'at_pickup_point':
            return 'bg-amber-50 text-amber-700 border-amber-200'
        case 'returned':
            return 'bg-rose-50 text-rose-700 border-rose-200'
        default:
            return 'bg-slate-50 text-slate-700 border-slate-200'
    }
}
