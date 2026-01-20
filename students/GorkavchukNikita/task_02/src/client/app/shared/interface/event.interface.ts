import type { ILocation } from './location.interface'

/**
 * Event Status (ES)
 * 0 - created
 * 1 - shipped
 * 2 - in_transit
 * 3 - out_for_delivery
 * 4 - delivered
 * 5 - at_pickup_point
 * 6 - returned
 */
export type TEventStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type IEventLocation = string | ILocation

/**
 * Tracking event (backend: Event model)
 */
export interface IEvent {
    _id: string
    orderId: string
    location: IEventLocation
    status: TEventStatus
    description?: string
    createdAt: string
    updatedAt: string
}

// export interface IEventAdmin extends IEvent {}
export type IEventAdmin = IEvent
