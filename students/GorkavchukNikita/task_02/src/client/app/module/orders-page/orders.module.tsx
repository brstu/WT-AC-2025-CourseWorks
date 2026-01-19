'use client'

import { WrapperComponent } from '@/app/shared/component/wrapper'
import { OrdersTableComponent } from './element/orders-list'

export const OrdersModule = () => {
    return (
        <WrapperComponent className="py-10 flex-1">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">My orders</h1>
                <p className="text-sm text-gray-600">A short list of your parcels.</p>
            </div>

            <OrdersTableComponent />
        </WrapperComponent>
    )
}
