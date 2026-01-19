export interface IRes<T = unknown> {
    status: EResponseStatus.ok | EResponseStatus.error
    code: number
    message?: string
    data?: T
}

export enum EResponseStatus {
    ok = 'ok',
    error = 'error',
}
