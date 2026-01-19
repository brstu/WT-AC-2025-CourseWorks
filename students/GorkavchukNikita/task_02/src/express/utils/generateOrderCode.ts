import { OrderModel } from '../types/order'
import { ORDER_ERRORS } from '../constants/errors'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const randomCode = () => {
    return Array.from(
        { length: 8 },
        () => alphabet[Math.floor(Math.random() * alphabet.length)]
    ).join('')
}

export async function generateOrderCode(Order: OrderModel): Promise<string> {
    let orderCode: string
    let isExist: boolean = true
    let attempts: number = 0

    while (isExist && attempts < 10) {
        orderCode = `ORD-${randomCode()}`
        const existing = await Order.exists({ orderCode })
        isExist = !!existing
        attempts++
    }

    if (isExist) {
        throw new Error(ORDER_ERRORS.GENERATE_CODE_FAILED)
    }

    return orderCode
}
