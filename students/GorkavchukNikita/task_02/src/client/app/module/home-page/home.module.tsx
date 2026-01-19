import { WrapperComponent } from '@/app/shared/component/wrapper'
import { OrderTracker } from '@/app/shared/component/order-tracker'

export const HomeModule = async () => {
    return (
        <WrapperComponent className="flex-1 flex">
            <div className="flex-1 flex items-center justify-center py-10">
                <OrderTracker />
            </div>
        </WrapperComponent>
    )
}
