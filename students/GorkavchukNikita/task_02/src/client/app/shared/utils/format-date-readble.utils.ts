export const formatDateReadable = (input: string | Date): string => {
    const date = typeof input === 'string' ? new Date(input) : input

    if (Number.isNaN(date.getTime())) return ''

    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ]

    const month = monthNames[date.getMonth()]

    return `${day} ${month} ${year} ${hours}:${minutes}`
}
