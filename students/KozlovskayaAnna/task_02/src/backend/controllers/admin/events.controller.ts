import { Response } from 'express'
import sharp from 'sharp'
import { PatchEventPayload } from '../../types/event'

import { AdminRequest } from '../../types/admin-request'

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { Event } from '../../models/event'
import { Atendee } from '../../models/atendee'
import { Ticket } from '../../models/ticket'
import { Invitation } from '../../models/invitation'

import { COMMON_ERRORS, EVENTS_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

import { renderMarkdown } from '../../utils/markdown'
import { randomFileName } from '../../utils/random-file-name'
import { normalizeStringToArray } from '../../utils/normalize-string-to-array'

const awsBucketName = process.env.AWS_BUCKET_NAME
const awsBucketRegion = process.env.AWS_BUCKET_REGION
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const clientParams = {
    region: awsBucketRegion,
    credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
    },
}

const s3 = new S3Client(clientParams)

export const createEvent = async (req: AdminRequest, res: Response) => {
    const { title, content, capacity, venue, startsAt, endsAt, speakers, alt } = req.body
    const cover = req?.file || undefined

    try {
        const mdContent = typeof content === 'string' ? content : ''
        const htmlContent = renderMarkdown(mdContent)

        const data = {
            title,
            content: {
                md: mdContent,
                html: htmlContent,
            },
            cover: {
                name: '',
                alt: '',
            },
            speakers: normalizeStringToArray(speakers),
            capacity: parseInt(capacity),
            venue,
            startsAt,
            endsAt,
        }

        if (!cover) {
            throw new Error(EVENTS_ERRORS.COVER_MISSING)
        }

        const buffer = await sharp(req.file.buffer)
            .resize(640, 800, { fit: 'cover', position: 'attention' })
            .toBuffer()

        const fileName = randomFileName(req.file.originalname)

        const command = new PutObjectCommand({
            Bucket: awsBucketName,
            Key: `public/events/${fileName}`,
            Body: buffer,
            ContentType: 'image/jpeg',
        })

        await s3.send(command)

        data.cover.name = fileName || ''
        data.cover.alt = alt || ''

        const { _id } = await Event.createEvent(data)
        const eventPopulated = await Event.findById(_id).populate({
            path: 'speakers',
            select: '-createdAt -updatedAt',
        })

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { event: eventPopulated },
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

export const getEvent = async (req: AdminRequest, res: Response) => {
    const { id } = req.params

    try {
        const event = await Event.findById(id as string).populate({
            path: 'speakers',
        })

        if (!event) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { event },
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

export const patchEvent = async (req: AdminRequest, res: Response) => {
    const { id } = req.params
    const { title, content, capacity, venue, startsAt, endsAt, speakers, alt } = req.body
    const cover = req?.file || undefined

    try {
        const existingEvent = await Event.findById(id as string)

        if (!existingEvent) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        const patchData: PatchEventPayload = { id: id as string }

        if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
            patchData.title = title
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'venue')) {
            patchData.venue = venue
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'capacity')) {
            patchData.capacity = capacity
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'content')) {
            const mdContent = typeof content === 'string' ? content : ''
            const htmlContent = renderMarkdown(mdContent)

            patchData.content = {
                md: mdContent,
                html: htmlContent,
            }
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'speakers')) {
            patchData.speakers = normalizeStringToArray(speakers)
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'startsAt')) {
            patchData.startsAt = startsAt
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'endsAt')) {
            patchData.endsAt = endsAt
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'alt')) {
            patchData.cover = {
                alt,
            }
        }

        if (cover) {
            const buffer = await sharp(req.file.buffer)
                .resize(640, 800, { fit: 'cover', position: 'attention' })
                .toBuffer()

            const fileName = randomFileName(req.file.originalname)

            const command = new PutObjectCommand({
                Bucket: awsBucketName,
                Key: `public/events/${fileName}`,
                Body: buffer,
                ContentType: 'image/jpeg',
            })

            await s3.send(command)

            const deleteCommand = new DeleteObjectCommand({
                Bucket: awsBucketName,
                Key: `public/events/${existingEvent.cover.name}`,
            })

            await s3.send(deleteCommand)

            patchData.cover = {
                ...(patchData.cover || {}),
                name: fileName,
            }
        }

        const event = await Event.patchEvent(patchData)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { event },
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

export const deleteEvent = async (req: AdminRequest, res: Response) => {
    const { id } = req.params

    try {
        const event = await Event.deleteEvent({ _id: id as string })

        if (!event) {
            throw new Error(EVENTS_ERRORS.NOT_FOUND)
        }

        await Promise.all([
            Atendee.deleteMany({ event_id: id as string }),
            Ticket.deleteMany({ event: id as string }),
            Invitation.deleteMany({ event: id as string }),
        ])

        const params = {
            Bucket: awsBucketName,
            Key: `public/events/${event.cover.name}`,
        }

        const command = new DeleteObjectCommand(params)
        await s3.send(command)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { event },
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
