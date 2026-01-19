import { Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { Order } from '../../models/order'
import { Event } from '../../models/event'

import { COMMON_ERRORS, EVENT_ERRORS, ORDER_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

// ES (Event Status) -> OS (Order Status)
const mapEventStatusToOrderStatus = (es: number) => {
    switch (es) {
        case 0:
            return 0 // created
        case 1:
            return 1 // shipped
        case 2:
            return 1 // in_transit -> shipped (в OS нет отдельного)
        case 3:
            return 1 // out_for_delivery -> shipped (в OS нет отдельного)
        case 4:
            return 2 // delivered
        case 5:
            return 3 // at_pickup_point
        case 6:
            return 5 // returned
        default:
            return 0
    }
}

const normalizeNumber = (value: unknown) => {
    if (value === undefined) return undefined
    const n = typeof value === 'string' ? parseInt(value, 10) : (value as number)
    return Number.isNaN(n) ? undefined : n
}

export const createOrder = async (req: AdminRequest, res: Response): Promise<void> => {
    const { name, userId, pickupLocation, currentLocation } = req.body

    const initialLocation = currentLocation ?? pickupLocation

    try {
        const order = await Order.createOrder({
            name,
            userId,
            pickupLocation,
            currentLocation: initialLocation,
        })

        await order.populate('pickupLocation currentLocation')

        const event = await Event.createEvent({
            orderId: order._id,
            location: initialLocation,
            status: 0,
        })

        await event.populate('location')

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order,
            events: [event],
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const getAllOrders = async (req: AdminRequest, res: Response) => {
    const { page: reqPage, limit: reqLimit } = req.query

    try {
        const pageParsed = parseInt((reqPage as string) || '1', 10)
        const limitParsed = parseInt((reqLimit as string) || '20', 10)

        const page = Number.isNaN(pageParsed) ? 1 : Math.max(1, pageParsed)
        const limit = Number.isNaN(limitParsed) ? 20 : Math.min(100, limitParsed)

        const skip = (page - 1) * limit
        const sort = (req.query.sort as string) || '-createdAt'
        const search = (req.query.search as string) || ''

        // optional filters
        const statusQuery = req.query.status as string | undefined
        const userId = req.query.userId as string | undefined
        const pickupLocation = req.query.pickupLocation as string | undefined
        const currentLocation = req.query.currentLocation as string | undefined

        const filter: any = {}

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { orderCode: { $regex: search, $options: 'i' } },
            ]
        }

        if (typeof statusQuery !== 'undefined' && statusQuery !== '') {
            const parsed = parseInt(statusQuery, 10)
            if (!Number.isNaN(parsed)) filter.status = parsed
        }

        if (userId) filter.userId = userId
        if (pickupLocation) filter.pickupLocation = pickupLocation
        if (currentLocation) filter.currentLocation = currentLocation

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        const [total, orders] = await Promise.all([
            Order.countDocuments(filter),
            Order.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate([
                    { path: 'pickupLocation', ...locationPopulate },
                    { path: 'currentLocation', ...locationPopulate },
                ])
                .lean({ virtuals: true }),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: orders,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const getOrder = async (req: AdminRequest, res: Response): Promise<void> => {
    const oid = (req.params.id || req.params.oid) as string

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        const order = await Order.findById(oid).populate([
            { path: 'pickupLocation', ...locationPopulate },
            { path: 'currentLocation', ...locationPopulate },
        ])

        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const events = await Event.find({ orderId: oid })
            .sort({ createdAt: 1 })
            .populate({
                path: 'location',
                select: '-_id -__v',
                populate: {
                    path: 'cityId',
                    select: '-_id -__v',
                    populate: {
                        path: 'countryId',
                        select: '-_id -__v',
                    },
                },
            })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order,
            events,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const patchOrder = async (req: AdminRequest, res: Response): Promise<void> => {
    const oid = (req.params.id || req.params.oid) as string
    const { name, userId, pickupLocation, currentLocation, status } = req.body

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        const order = await Order.findById(oid)
        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const update: Record<string, any> = {}

        // Обновляем только то, что реально передали
        for (const [key, value] of Object.entries({
            name,
            userId,
            pickupLocation,
            currentLocation,
            status,
        })) {
            if (value !== undefined) {
                update[key] = value
            }
        }

        if (Object.keys(update).length === 0) {
            throw new Error('Nothing to update!')
        }

        const updated = await Order.findByIdAndUpdate(
            oid,
            { $set: update },
            {
                new: true,
                runValidators: true,
                context: 'query',
            }
        )

        if (!updated) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        await updated.populate([
            {
                path: 'pickupLocation',
                select: '-_id -__v',
                populate: {
                    path: 'cityId',
                    select: '-_id -__v',
                    populate: { path: 'countryId', select: '-_id -__v' },
                },
            },
            {
                path: 'currentLocation',
                select: '-_id -__v',
                populate: {
                    path: 'cityId',
                    select: '-_id -__v',
                    populate: { path: 'countryId', select: '-_id -__v' },
                },
            },
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order: updated,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const deleteOrder = async (req: AdminRequest, res: Response): Promise<void> => {
    const oid = (req.params.id || req.params.oid) as string

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        const order = await Order.findById(oid)
        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const eventsResult = await Event.deleteMany({ orderId: oid })

        const deletedOrder = await Order.findByIdAndDelete(oid)
        if (!deletedOrder) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order: deletedOrder,
            deletedEventsCount: eventsResult.deletedCount || 0,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

// Events

export const createEvent = async (req: AdminRequest, res: Response): Promise<void> => {
    const { oid } = req.params
    const { location, status, description } = req.body

    // ES (Event Status) -> OS (Order Status)
    // OS: 0 created, 1 shipped, 2 delivered, 3 at_pickup_point, 5 returned
    // ES: 0 created, 1 shipped, 2 in_transit, 3 out_for_delivery, 4 delivered, 5 at_pickup_point, 6 returned
    const mapEventStatusToOrderStatus = (es: number) => {
        switch (es) {
            case 0:
                return 0 // created
            case 1:
                return 1 // shipped
            case 2:
                return 1 // in_transit -> shipped
            case 3:
                return 1 // out_for_delivery -> shipped
            case 4:
                return 2 // delivered
            case 5:
                return 3 // at_pickup_point
            case 6:
                return 5 // returned
            default:
                return 0
        }
    }

    try {
        if (!oid) throw new Error(ORDER_ERRORS.UNDEFINED_OID)

        const eventStatus = typeof status === 'string' ? parseInt(status, 10) : status
        if (Number.isNaN(eventStatus)) {
            throw new Error(`${EVENT_ERRORS.REQUIRED_FIELDS}: status`)
        }

        const orderExists = await Order.findById(oid)
        if (!orderExists) throw new Error(ORDER_ERRORS.NOT_FOUND)

        const event = await Event.createEvent({
            orderId: oid,
            location,
            status: eventStatus,
            description,
        })

        const orderStatus = mapEventStatusToOrderStatus(eventStatus)

        const updatedOrder = await Order.findByIdAndUpdate(
            oid,
            { $set: { status: orderStatus, currentLocation: location } },
            { new: true, runValidators: true, context: 'query' }
        )

        if (!updatedOrder) throw new Error(ORDER_ERRORS.NOT_FOUND)

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        await event.populate({ path: 'location', ...locationPopulate })
        await updatedOrder.populate([
            { path: 'pickupLocation', ...locationPopulate },
            { path: 'currentLocation', ...locationPopulate },
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            order: updatedOrder,
            event,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const getEvent = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id, oid } = req.params

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        const order = await Order.findById(oid)

        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const event = await Event.findById(id).populate({
            path: 'location',
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        })

        if (!event) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        if (String(event.orderId) !== String(oid)) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            event,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const getOrderEvents = async (req: AdminRequest, res: Response): Promise<void> => {
    const { oid } = req.params

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        const order = await Order.findById(oid)

        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const events = await Event.find({ orderId: oid })
            .sort({ createdAt: 1 })
            .populate({
                path: 'location',
                select: '-_id -__v',
                populate: {
                    path: 'cityId',
                    select: '-_id -__v',
                    populate: {
                        path: 'countryId',
                        select: '-_id -__v',
                    },
                },
            })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            events,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const patchEvent = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id, oid } = req.params
    const { location, status, description } = req.body

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        if (!id) {
            throw new Error(EVENT_ERRORS.ID_REQUIRED)
        }

        const order = await Order.findById(oid)
        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        // ✅ проверяем что event существует и относится к этому заказу
        const existingEvent = await Event.findById(id)
        if (!existingEvent) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }
        if (String(existingEvent.orderId) !== String(oid)) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        // иногда status приходит строкой из select
        const parsedStatus = normalizeNumber(status)
        if (status !== undefined && parsedStatus === undefined) {
            throw new Error(`${EVENT_ERRORS.REQUIRED_FIELDS}: status`)
        }

        // патчим само событие
        const event = await Event.patchEvent({
            _id: id,
            orderId: oid, // Event.patchEvent игнорит, но оставим для читаемости
            location,
            status: parsedStatus,
            description,
        })

        // ✅ пересчитываем "текущее состояние" заказа по последнему событию (НО статус маппим в OS)
        const lastEvent = await Event.findOne({ orderId: oid }).sort({ createdAt: -1 })

        const orderUpdate = lastEvent
            ? {
                  status: mapEventStatusToOrderStatus(lastEvent.status),
                  currentLocation: lastEvent.location,
              }
            : { status: 0, currentLocation: order.pickupLocation }

        const updatedOrder = await Order.findByIdAndUpdate(
            oid,
            { $set: orderUpdate },
            { new: true, runValidators: true, context: 'query' }
        )

        // deep populate (как у тебя в других местах)
        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        await event.populate({ path: 'location', ...locationPopulate })
        if (updatedOrder) {
            await updatedOrder.populate([
                { path: 'pickupLocation', ...locationPopulate },
                { path: 'currentLocation', ...locationPopulate },
            ])
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            event,
            order: updatedOrder,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}

export const deleteEvent = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id, oid } = req.params

    try {
        if (!oid) {
            throw new Error(ORDER_ERRORS.UNDEFINED_OID)
        }

        if (!id) {
            throw new Error(EVENT_ERRORS.ID_REQUIRED)
        }

        const order = await Order.findById(oid)
        if (!order) {
            throw new Error(ORDER_ERRORS.NOT_FOUND)
        }

        const existingEvent = await Event.findById(id)
        if (!existingEvent) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        if (String(existingEvent.orderId) !== String(oid)) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        const event = await Event.deleteEvent({ _id: id })

        if (String(event.orderId) !== String(oid)) {
            throw new Error(EVENT_ERRORS.NOT_FOUND)
        }

        const lastEvent = await Event.findOne({ orderId: oid }).sort({ createdAt: -1 })

        const orderUpdate = lastEvent
            ? {
                  status: mapEventStatusToOrderStatus(lastEvent.status),
                  currentLocation: lastEvent.location,
              }
            : { status: 0, currentLocation: order.pickupLocation }

        const updatedOrder = await Order.findByIdAndUpdate(
            oid,
            { $set: orderUpdate },
            { new: true, runValidators: true, context: 'query' }
        )

        const locationPopulate = {
            select: '-_id -__v',
            populate: {
                path: 'cityId',
                select: '-_id -__v',
                populate: {
                    path: 'countryId',
                    select: '-_id -__v',
                },
            },
        }

        await event.populate({ path: 'location', ...locationPopulate })
        if (updatedOrder) {
            await updatedOrder.populate([
                { path: 'pickupLocation', ...locationPopulate },
                { path: 'currentLocation', ...locationPopulate },
            ])
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            event,
            order: updatedOrder,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED

        res.status(HTTP_STATUS.BAD_REQUEST).json({
            status: RESPONSE_STATUS.ERROR,
            code: HTTP_STATUS.BAD_REQUEST,
            message,
        })
    }
}
