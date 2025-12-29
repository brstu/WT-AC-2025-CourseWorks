import { AuthRequest } from './auth-request'

export interface AdminRequest extends AuthRequest {
    role?: string
}
