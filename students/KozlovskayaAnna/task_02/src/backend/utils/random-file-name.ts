import crypto from 'crypto'
import path from 'path'

export function randomFileName(originalName?: string, prefix = ''): string {
    const ext = originalName ? path.extname(originalName).toLowerCase() : ''
    const id = crypto.randomBytes(16).toString('hex')
    return `${prefix}${id}${ext}`
}
