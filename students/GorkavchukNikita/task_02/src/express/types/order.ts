import { HydratedDocument, Model, Types } from 'mongoose'

export interface IOrder {
    _id: string
    name: string
    userId: Types.ObjectId
    orderCode: string
    status: number
    pickupLocation: Types.ObjectId
    currentLocation: Types.ObjectId
}

export type OrderDoc = HydratedDocument<IOrder>

export interface OrderStatics {
    createOrder(
        {
            name,
            userId,
            pickupLocation,
            currentLocation,
        }: {
            name: string
            userId: Types.ObjectId
            pickupLocation: Types.ObjectId
            currentLocation: Types.ObjectId
        },
        select?: string
    ): Promise<OrderDoc>
}

export type OrderModel = Model<IOrder> & OrderStatics
