import { WrapperComponent } from '@/app/shared/component/wrapper'
import { MenuComponent } from './element/menu'
import { EventsComponent } from './element/events'

export const dynamic = 'force-dynamic'

export const HomeModule = async () => {
    return (
        <WrapperComponent>
            <div className="py-6 grid grid-cols-1 gap-5 lg:grid-cols-[180px_1fr]">
                <MenuComponent />
                <EventsComponent />
            </div>
        </WrapperComponent>
    )
}
