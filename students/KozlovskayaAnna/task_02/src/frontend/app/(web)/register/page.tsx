'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterModule } from '@/app/module/register-page'
import { useGetUserProfile } from '@/app/shared/hooks/'

export default function Page() {
    const router = useRouter()
    const { isLoading, getUserProfile } = useGetUserProfile()

    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await getUserProfile()

                if (data?.data?.user) {
                    router.replace('/')
                }
            } catch {}
        }

        checkUser()
    }, [getUserProfile, router])

    if (isLoading) {
        return (
            <div className="text-center">
                <h3>Loading...</h3>
            </div>
        )
    }

    return <RegisterModule />
}
