export const formatDate = (iso: string) => {
    const date = new Date(iso)

    const formatted = date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    })

    return formatted
}

export const formatDateToMonth = (iso: string) => {
    const date = new Date(iso)

    const formatted = date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
    })

    return formatted
}

export const formatDateToTime = (iso: string) => {
    const date = new Date(iso)

    const formatted = date.toLocaleString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return formatted
}
