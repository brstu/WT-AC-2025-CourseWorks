import { EUserRoles } from '@/app/constants/user-roles'
import { NotFoundModule } from '@/app/module/not-found'
import { getUserRole } from '@/app/shared/services'
import { AdminNavComponent } from './element/admin-nav'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const role = await getUserRole()

    if (role !== EUserRoles.ADMIN) {
        return <NotFoundModule />
    }

    return (
        <div>
            <AdminNavComponent />
            {children}
        </div>
    )
}
