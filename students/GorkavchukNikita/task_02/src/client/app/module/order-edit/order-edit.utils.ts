import type { ILocationLite } from './order-edit.types'

export const formatDateTime = (date: string | number | Date) => {
    try {
        return new Date(date).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return String(date)
    }
}

export const formatLocation = (loc?: ILocationLite | null) => {
    if (!loc) return ''

    const city = loc.cityId?.name
    const country = loc.cityId?.countryId?.name
    const place = [city, country].filter(Boolean).join(', ')

    const base = `${loc.label} (${loc.locationCode})`

    return place ? `${base} — ${place}` : base
}
