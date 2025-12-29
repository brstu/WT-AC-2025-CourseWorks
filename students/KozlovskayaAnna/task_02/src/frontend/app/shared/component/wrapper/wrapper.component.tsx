import clsx from 'clsx'

interface IProps {
    children?: React.ReactNode
    className?: string
}

export const WrapperComponent = ({ children, className }: IProps) => {
    return <div className={clsx('wrapper', className)}>{children}</div>
}
