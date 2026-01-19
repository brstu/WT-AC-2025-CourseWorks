import clsx from 'clsx'
import { ShieldAlert } from 'lucide-react'

interface IProps {
    children?: string
    className?: string
}

export const ErrorComponent = ({ children, className }: IProps) => {
    return (
        <div
            className={clsx(
                'flex items-start gap-1 py-1 px-3 rounded-md text-left break-all',
                'bg-red-200 text-red-500 border border-red-500',
                className
            )}
        >
            <ShieldAlert className="inline-block size-5 shrink-0 translate-y-0.5" />
            {children}
        </div>
    )
}
