'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { IUser } from '@/app/shared/interface/'

interface UserState {
    user: IUser | null
    setUser: (user: IUser | null) => void
    clearUser: () => void
    setInitialized: (value: boolean) => void
}

export const useUserStore = create<UserState>()(
    devtools(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'UserStore',
            enabled: process.env.NODE_ENV !== 'production' && typeof window !== 'undefined',
        }
    )
)
