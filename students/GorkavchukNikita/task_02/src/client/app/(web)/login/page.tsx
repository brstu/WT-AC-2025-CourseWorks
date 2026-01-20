import { redirect } from 'next/navigation'
import { LoginModule } from '@/app/module/login-page'
import { getUserProfileServer } from '@/app/shared/services/get-user-profile-server'
import { EAppRoutes } from '@/app/constants'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const userProfile = await getUserProfileServer()

    if (userProfile) {
        redirect(EAppRoutes.BASE)
    }

    return <LoginModule />
}
