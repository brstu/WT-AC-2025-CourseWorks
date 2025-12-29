export const isBlankField = (field: any) => {
    return (
        field === undefined ||
        field === null ||
        (typeof field === 'string' && field.trim() === '') ||
        (Array.isArray(field) && field.length === 0)
    )
}
