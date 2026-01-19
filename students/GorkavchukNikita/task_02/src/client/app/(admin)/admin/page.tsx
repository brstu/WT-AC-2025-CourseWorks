import { redirect } from 'next/navigation'
import { EAppRoutes } from '@/app/constants'

export default async function Page() {
    // return <div>123</div>
    redirect(EAppRoutes.ADMIN_USERS)
}
