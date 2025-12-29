import { getInvitationsServer } from '@/app/shared/services'
import { InvitationsModule } from '@/app/module/invitations'

export const dynamic = 'force-dynamic'

export default async function Page() {
    const invitations = await getInvitationsServer()

    return <InvitationsModule invitations={invitations || []} />
}
