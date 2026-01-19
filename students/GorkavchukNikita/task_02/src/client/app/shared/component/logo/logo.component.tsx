import clsx from 'clsx'
import { Boxes } from 'lucide-react'

export const LogoComponent = () => {
    return (
        <div
            className={clsx(
                'text-foreground uppercase text-xl font-black select-none flex items-center',
                "after:content-['Parcel_Tracker'] after:block"
            )}
        >
            <Boxes className="inline-block mr-1.5" />
        </div>
    )
}
