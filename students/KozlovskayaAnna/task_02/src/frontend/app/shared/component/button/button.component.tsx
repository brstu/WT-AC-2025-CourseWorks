import clsx from 'clsx'
import { LoaderCircle, type LucideIcon } from 'lucide-react'

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft'
type ButtonColor =
    | 'amber'
    | 'violet'
    | 'indigo'
    | 'rose'
    | 'danger'
    | 'green'
    | 'emerald'
    | 'black'
    | 'white'

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string
    children?: React.ReactNode
    variant?: ButtonVariant
    color?: ButtonColor
    startIcon?: LucideIcon
    startIconClassName?: string
    endIcon?: LucideIcon
    endIconClassName?: string
    isSubmiting?: boolean
    disabled?: boolean
    disableOutline?: boolean
}

export const Button = ({
    children,
    className,
    variant = 'solid',
    color = 'amber',
    startIcon: StartIcon,
    startIconClassName,
    endIcon: EndIcon,
    endIconClassName,
    isSubmiting,
    disabled,
    disableOutline,
    ...props
}: IProps) => {
    const colorStyles: Record<ButtonColor, Record<ButtonVariant, string>> = {
        amber: {
            solid: 'border-transparent bg-amber-400 text-light hover:bg-amber-500 focus-visible:ring-amber-400',
            outline:
                'border-amber-400 bg-amber-400/0 text-amber-400 hover:bg-amber-500 hover:text-light hover:border-amber-500 focus-visible:ring-amber-400',
            ghost: 'border-transparent bg-amber-500/0 text-amber-400 hover:bg-amber-600/20 hover:text-amber-500 focus-visible:ring-amber-400',
            soft: 'border-transparent bg-amber-600/15 text-amber-400 hover:bg-amber-500/30 hover:text-amber-500 focus-visible:ring-amber-400',
        },

        violet: {
            solid: 'border-transparent bg-violet-400 text-light hover:bg-violet-500 focus-visible:ring-violet-400',
            outline:
                'border-violet-400 bg-violet-400/0 text-violet-400 hover:bg-violet-500 hover:text-light hover:border-violet-500 focus-visible:ring-violet-400',
            ghost: 'border-transparent bg-violet-500/0 text-violet-400 hover:bg-violet-600/20 hover:text-violet-500 focus-visible:ring-violet-400',
            soft: 'border-transparent bg-violet-600/15 text-violet-400 hover:bg-violet-500/30 hover:text-violet-500 focus-visible:ring-violet-400',
        },

        indigo: {
            solid: 'border-transparent bg-indigo-400 text-light hover:bg-indigo-500 focus-visible:ring-indigo-400',
            outline:
                'border-indigo-400 bg-indigo-400/0 text-indigo-400 hover:bg-indigo-500 hover:text-light hover:border-indigo-500 focus-visible:ring-indigo-400',
            ghost: 'border-transparent bg-indigo-500/0 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-500 focus-visible:ring-indigo-400',
            soft: 'border-transparent bg-indigo-600/15 text-indigo-400 hover:bg-indigo-500/30 hover:text-indigo-500 focus-visible:ring-indigo-400',
        },

        rose: {
            solid: 'border-transparent bg-rose-400 text-light hover:bg-rose-500 focus-visible:ring-rose-400',
            outline:
                'border-rose-400 bg-rose-400/0 text-rose-400 hover:bg-rose-500 hover:text-light hover:border-rose-500 focus-visible:ring-rose-400',
            ghost: 'border-transparent bg-rose-500/0 text-rose-400 hover:bg-rose-600/20 hover:text-rose-500 focus-visible:ring-rose-400',
            soft: 'border-transparent bg-rose-600/15 text-rose-400 hover:bg-rose-500/30 hover:text-rose-500 focus-visible:ring-rose-400',
        },

        danger: {
            solid: 'border-transparent bg-red-400 text-light hover:bg-red-500 focus-visible:ring-red-400',
            outline:
                'border-red-400 bg-red-400/0 text-red-400 hover:bg-red-500 hover:text-light hover:border-red-500 focus-visible:ring-red-400',
            ghost: 'border-transparent bg-red-500/0 text-red-400 hover:bg-red-600/20 hover:text-red-500 focus-visible:ring-red-400',
            soft: 'border-transparent bg-red-600/15 text-red-400 hover:bg-red-500/30 hover:text-red-500 focus-visible:ring-red-400',
        },

        green: {
            solid: 'border-transparent bg-green-400 text-light hover:bg-green-500 focus-visible:ring-green-400',
            outline:
                'border-green-400 bg-green-400/0 text-green-400 hover:bg-green-500 hover:text-light hover:border-green-500 focus-visible:ring-green-400',
            ghost: 'border-transparent bg-green-500/0 text-green-400 hover:bg-green-600/20 hover:text-green-500 focus-visible:ring-green-400',
            soft: 'border-transparent bg-green-600/15 text-green-400 hover:bg-green-500/30 hover:text-green-500 focus-visible:ring-green-400',
        },

        emerald: {
            solid: 'border-transparent bg-emerald-400 text-light hover:bg-emerald-500 focus-visible:ring-emerald-400',
            outline:
                'border-emerald-400 bg-emerald-400/0 text-emerald-400 hover:bg-emerald-500 hover:text-light hover:border-emerald-500 focus-visible:ring-emerald-400',
            ghost: 'border-transparent bg-emerald-500/0 text-emerald-400 hover:bg-emerald-600/20 hover:text-emerald-500 focus-visible:ring-emerald-400',
            soft: 'border-transparent bg-emerald-600/15 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-500 focus-visible:ring-emerald-400',
        },

        black: {
            solid: 'border-transparent bg-foreground text-light hover:bg-foreground/90 focus-visible:ring-foreground',
            outline:
                'border-foreground bg-transparent text-foreground hover:bg-foreground/5 hover:text-foreground focus-visible:ring-foreground',
            ghost: 'border-transparent bg-transparent text-foreground hover:bg-foreground/10 hover:text-foreground focus-visible:ring-foreground',
            soft: 'border-transparent bg-foreground/10 text-foreground hover:bg-foreground/20 hover:text-foreground focus-visible:ring-foreground',
        },

        white: {
            solid: 'border-transparent bg-light text-foreground hover:bg-light/90 focus-visible:ring-light',
            outline:
                'border-light bg-transparent text-light hover:bg-light hover:text-foreground focus-visible:ring-light',
            ghost: 'border-transparent bg-transparent text-light hover:bg-light/10 hover:text-light focus-visible:ring-light',
            soft: 'border-transparent bg-light/10 text-light hover:bg-light/20 hover:text-light focus-visible:ring-light',
        },
    }

    const isDisabled = isSubmiting || disabled

    return (
        <button
            {...props}
            className={clsx(
                'flex items-center justify-center',
                children ? 'px-1.5 py-2' : 'px-2 py-2',
                'cursor-pointer leading-none rounded-md text-base/5 font-semibold border-2 text-center',
                'transition-colors',
                !disableOutline &&
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                colorStyles[color][variant],
                isDisabled &&
                    'opacity-75 pointer-events-none hover:bg-inherit hover:text-inherit hover:border-inherit',
                className
            )}
        >
            {isSubmiting ? (
                <span>{<LoaderCircle className="size-4 animate-spin scale-130" />}</span>
            ) : (
                <>
                    {StartIcon && (
                        <StartIcon
                            className={clsx('size-4', children && 'mr-1', startIconClassName)}
                        />
                    )}
                    {children}
                    {EndIcon && (
                        <EndIcon className={clsx('size-4', children && 'ml-1', endIconClassName)} />
                    )}
                </>
            )}
        </button>
    )
}
