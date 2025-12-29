export const formatDateForInput = (dateString?: string | Date | null) => {
    if (!dateString) return ''

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (Number.isNaN(date.getTime())) return ''

    const pad = (n: number) => n.toString().padStart(2, '0')

    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())

    return `${year}-${month}-${day}T${hours}:${minutes}`
}
