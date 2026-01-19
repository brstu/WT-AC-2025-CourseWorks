import { Schema, model, models } from 'mongoose'
import { IOrder, OrderModel } from '../types/order'
import { ORDER_ERRORS } from '../constants/errors'
import { generateOrderCode } from '../utils/generateOrderCode'

export const orderSchema = new Schema<IOrder, OrderModel>(
    {
        name: {
            type: String,
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        orderCode: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            required: true,
        },
        pickupLocation: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        currentLocation: {
            type: Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
    },
    { timestamps: true }
)

// Admin

orderSchema.statics.createOrder = async function (props, select = '') {
    const { name, userId, pickupLocation, currentLocation } = props

    for (const [key, value] of Object.entries(props)) {
        if (value === undefined || value === null || value === '') {
            throw new Error(`${ORDER_ERRORS.REQUIRED_FIELDS}: ${key}`)
        }
    }

    const orderCode = await generateOrderCode(this)

    const order = await this.create({
        name,
        status: 0,
        userId,
        orderCode,
        pickupLocation,
        currentLocation,
    })

    return order
}

export const Order = (models.Order as OrderModel) || model<IOrder, OrderModel>('Order', orderSchema)
