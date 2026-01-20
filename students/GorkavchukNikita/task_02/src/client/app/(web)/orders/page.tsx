import { redirect } from 'next/navigation'

import { getUserProfileServer } from '@/app/shared/services'
import { OrdersModule } from '@/app/module/orders-page'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const user = await getUserProfileServer()

    if (!user) {
        redirect('/login')
    }

    return <OrdersModule />
}
