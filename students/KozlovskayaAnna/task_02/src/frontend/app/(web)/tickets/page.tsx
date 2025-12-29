import { getTicketsServer } from '@/app/shared/services'
import { TicketsPageModule } from '@/app/module/tickets-page/tickets-page.module'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const tickets = await getTicketsServer()

    return <TicketsPageModule tickets={tickets || []} />
}
