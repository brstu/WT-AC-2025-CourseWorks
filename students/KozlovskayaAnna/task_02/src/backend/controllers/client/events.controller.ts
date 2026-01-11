import { Request, Response } from 'express'
import { AuthRequest } from '../../types/auth-request'

import { Event } from '../../models/event'
import { Atendee } from '../../models/atendee'
import { Invitation } from '../../models/invitation'
import { Ticket } from '../../models/ticket'

import { COMMON_ERRORS, EVENTS_ERRORS, INVITATION_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'
import { ETicketStatus } from '../../constants/ticket-status'

import { generateCode } from '../../utils/generate-code'
import { generateUniqueTicketCode } from '../../utils/generate-unique-ticket-code'
import { User } from '../../models/user'

// Non Auth

export const getEvent = async (req: AuthRequest, res: Response) => {
    const { id } = req.params

    try {
        const event = await Event.findById(id as string)
            .select('-content.md -createdAt -updatedAt')
            .populate({
                path: 'speakers',
                select: '-createdAt -updatedAt',
            })
            .lean()

        if (!event) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        const atendee = await Atendee.findOne({ event_id: event._id, user_id: req.userId })
        const atendeesCount = await Atendee.countDocuments({ event_id: event._id })

        const data = {
            ...event,
            atendeesCount,
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { event: data, atendee },
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

export const getEvents = async (req: Request, res: Response) => {
    const { page = '1', limit = '6' } = req.query

    const pageNumber = Math.max(parseInt(page as string, 10) || 1, 1)
    const limitNumber = Math.max(parseInt(limit as string, 10) || 6, 1)
    const skip = (pageNumber - 1) * limitNumber

    try {
        const [events, total] = await Promise.all([
            Event.find()
                .select('venue title startsAt cover')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),
            Event.countDocuments(),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: {
                events,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    hasMore: skip + events.length < total,
                },
            },
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

// Auth

export const registerToEvent = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        const event = await Event.findById(id).select('_id capacity').lean()

        if (!event) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        const atendeesCount = await Atendee.countDocuments({ event_id: id })

        if (event.capacity != null && atendeesCount >= event.capacity) {
            throw new Error(`${EVENTS_ERRORS.CAPACITY_REACHED_MAXIMUM_CAPACITY}: ${event.capacity}`)
        }

        const atendee = await Atendee.registerToEvent({ event_id: id as string, user_id })

        // Creating Ticket
        const ticketCode = await generateUniqueTicketCode(Ticket, 10)

        const ticket = await Ticket.createTicket({
            atendee_id: atendee._id.toString(),
            user_id: user_id,
            event: event._id,
            code: ticketCode,
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { atendee, ticket },
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

export const unregisterFromEvent = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user_id = req.userId

    try {
        const atendee = await Atendee.unregisterFromEvent({ event_id: id as string, user_id })
        await Ticket.unregisterAtendeeFromEvent({ atendee_id: atendee._id.toString() })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { atendee },
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

export const createInvitation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user_id = req.userId

    const { user_email } = req.body

    try {
        const userToInvite = await User.findOne({ email: user_email }).lean().select('_id')
        const userIsAtendee = await Atendee.findOne({
            user_id: userToInvite._id,
            event_id: id,
        })

        if (userIsAtendee) {
            throw new Error(INVITATION_ERRORS.ALREADY_PARTICIPATING)
        }

        const invitation = await Invitation.createInvitation({
            event: id as string,
            user_invited: userToInvite._id,
            invited_by: user_id,
        })
        const invitationPopulated = await Invitation.findById(invitation._id)
            .populate('invited_by', 'name email')
            .populate('user_invited', 'name email')

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { invitation: invitationPopulated },
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

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user_id = req.userId

    console.log('[DEBUG] headers', req.headers)
    console.log('[DEBUG] raw body', req.body)

    const { invitation_id } = req.body

    try {
        if (!invitation_id) {
            throw new Error(INVITATION_ERRORS.ID_REQUIRED)
        }

        const event = await Event.findById(id).select('_id capacity').lean()

        if (!event) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        const invitation = await Invitation.findOne({ user_invited: user_id, event: id })

        if (!invitation) {
            throw new Error(INVITATION_ERRORS.NO_INVITATION)
        }

        const atendeesCount = await Atendee.countDocuments({ event_id: id })

        if (event.capacity != null && atendeesCount >= event.capacity) {
            throw new Error(`${EVENTS_ERRORS.CAPACITY_REACHED_MAXIMUM_CAPACITY}: ${event.capacity}`)
        }

        const atendee = await Atendee.registerToEvent({ event_id: id as string, user_id })

        const ticketCode = await generateUniqueTicketCode(Ticket, 10)

        const ticket = await Ticket.createTicket({
            atendee_id: atendee._id.toString(),
            user_id: user_id,
            event: event._id,
            code: ticketCode,
        })

        const invitationDeleted = await Invitation.deleteInvitation({
            _id: invitation_id,
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { invitation: invitationDeleted, atendee, ticket },
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

export const declineInvitation = async (req: AuthRequest, res: Response) => {
    const { id } = req.params
    const user_id = req.userId

    const { invitation_id } = req.body

    try {
        if (!invitation_id) {
            throw new Error(INVITATION_ERRORS.ID_REQUIRED)
        }

        const invitation = await Invitation.findOne({
            _id: invitation_id,
            user_invited: user_id,
            event: id,
        })

        if (!invitation) {
            throw new Error(INVITATION_ERRORS.NO_INVITATION)
        }

        const invitationDeleted = await Invitation.deleteInvitation({
            _id: invitation_id,
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { invitation: invitationDeleted },
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
