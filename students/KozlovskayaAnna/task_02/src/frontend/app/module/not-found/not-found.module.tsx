import Link from 'next/link'
import { WrapperComponent } from '@/app/shared/component/wrapper'
import { Button } from '@/app/shared/component/button'
import { Undo2 } from 'lucide-react'

export const NotFoundModule = () => {
    return (
        <WrapperComponent className="flex flex-col items-center gap-2 py-6">
            <h3 className="text-xl font-bold">This Page does not exists</h3>
            <Link href={'/'}>
                <Button variant="ghost" color="indigo" startIcon={Undo2}>
                    Go Home
                </Button>
            </Link>
        </WrapperComponent>
    )
}
