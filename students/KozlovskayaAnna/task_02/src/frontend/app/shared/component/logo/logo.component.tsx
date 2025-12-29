import clsx from 'clsx'

export const LogoComponent = () => {
    return (
        <div
            className={clsx(
                'text-light uppercase text-xl font-black select-none',
                "after:content-['Zafich.Idem_🎤'] after:block"
            )}
        />
    )
}
