// utils/normalize-speakers.ts
import { isValidObjectId } from 'mongoose'

export function normalizeStringToArray(input: unknown): string[] {
    if (Array.isArray(input)) return input.map(String)

    if (typeof input === 'string') {
        const s = input.trim()
        if (!s) return []

        if (s.startsWith('[') && s.endsWith(']') && s.includes('"')) {
            try {
                const arr = JSON.parse(s)
                return Array.isArray(arr) ? arr.map(String) : []
            } catch {
                /* fallthrough */
            }
        }

        try {
            const fixed = s.replace(/'/g, '"')
            const arr = JSON.parse(fixed)
            if (Array.isArray(arr)) return arr.map(String)
        } catch {
            /* fallthrough */
        }

        return s
            .split(',')
            .map((x) => x.replace(/[\[\]\s'"]/g, ''))
            .filter(Boolean)
    }

    return []
}

export function validateObjectIds(ids: string[]): string[] {
    return ids.filter((id) => !isValidObjectId(id))
}
