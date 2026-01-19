import { WrapperComponent } from '@/app/shared/component/wrapper'

export const FooterComponent = () => {
    return (
        <footer className="text-foreground/50">
            <WrapperComponent className="min-h-10 flex justify-between items-center sm:flex-row flex-col">
                <span className="uppercase">parcel tracker</span>{' '}
                <span className="uppercase">
                    all rights reserved &copy; {new Date().getFullYear()}
                </span>
            </WrapperComponent>
        </footer>
    )
}
