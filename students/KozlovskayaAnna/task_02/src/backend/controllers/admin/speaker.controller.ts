import sharp from 'sharp'
import { Response } from 'express'
import { AdminRequest } from '../../types/admin-request'
import { Speaker } from '../../models/speaker'

import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'

import { COMMON_ERRORS, SPEAKERS_ERRORS } from '../../constants/errors'
import { HTTP_STATUS } from '../../constants/http-status'
import { RESPONSE_STATUS } from '../../constants/response-status'

import { randomFileName } from '../../utils/random-file-name'
import { PatchSpeakerPayload } from '../../types/speaker'

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

export const createSpeaker = async (req: AdminRequest, res: Response): Promise<void> => {
    const { name, bio, contacts, alt } = req.body
    try {
        const upload = req?.file || undefined

        const data = {
            name,
            bio,
            contacts: JSON.parse(contacts),
            photo: {
                name: '',
                alt: '',
            },
        }

        if (upload) {
            const buffer = await sharp(req.file.buffer)
                .resize(256, 256, { fit: 'contain', position: 'attention' })
                .jpeg({
                    quality: 90,
                    mozjpeg: true,
                    progressive: true,
                })
                .toBuffer()

            const fileName = randomFileName(req.file.originalname)

            const command = new PutObjectCommand({
                Bucket: awsBucketName,
                Key: `public/speakers/${fileName}`,
                Body: buffer,
                ContentType: 'image/jpeg',
            })

            await s3.send(command)

            data.photo.name = fileName
            data.photo.alt = alt
        }

        const speaker = await Speaker.createSpeaker(data)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { speaker },
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

export const getSpeaker = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const speaker = await Speaker.findById(id as string).lean()

        if (!speaker) {
            throw new Error(SPEAKERS_ERRORS.NOT_FOUND)
        }

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { speaker },
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

export const getAllSpeakers = async (req: AdminRequest, res: Response) => {
    try {
        const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
        const limit = Math.min(100, parseInt((req.query.limit as string) || '20', 10))
        const skip = (page - 1) * limit
        const sort = (req.query.sort as string) || '-createdAt'
        const search = (req.query.search as string) || ''

        const filter: any = {}
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ]
        }

        const [total, speakers] = await Promise.all([
            Speaker.countDocuments(filter),
            Speaker.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        ])

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                speakers,
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

export const patchSpeaker = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params
    const { name, bio, alt, contacts } = req.body
    const upload = req?.file || undefined

    try {
        const existingSpeaker = await Speaker.findById(id as string)

        if (!existingSpeaker) {
            throw new Error(SPEAKERS_ERRORS.NOT_FOUND)
        }

        const patchData: PatchSpeakerPayload = { _id: id as string }

        if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
            patchData.name = name
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'bio')) {
            patchData.bio = bio
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'contacts')) {
            patchData.contacts = JSON.parse(contacts)
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'alt')) {
            patchData.photo = {
                alt,
            }
        }

        if (upload) {
            const buffer = await sharp(req.file.buffer)
                .resize(256, 256, { fit: 'cover', position: 'attention' })
                .toBuffer()

            const fileName = randomFileName(req.file.originalname)

            const command = new PutObjectCommand({
                Bucket: awsBucketName,
                Key: `public/speakers/${fileName}`,
                Body: buffer,
                ContentType: 'image/jpeg',
            })

            await s3.send(command)

            const deleteCommand = new DeleteObjectCommand({
                Bucket: awsBucketName,
                Key: `public/speakers/${existingSpeaker.photo.name}`,
            })

            await s3.send(deleteCommand)

            patchData.photo = {
                ...(patchData.photo || {}),
                name: fileName,
            }
        }

        const speaker = await Speaker.patchSpeaker(patchData)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { speaker },
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

export const deleteSpeaker = async (req: AdminRequest, res: Response): Promise<void> => {
    const { id } = req.params

    try {
        const speaker = await Speaker.deleteSpeaker({ _id: id as string })

        if (!speaker) {
            throw new Error(SPEAKERS_ERRORS.NOT_FOUND)
        }

        const params = {
            Bucket: awsBucketName,
            Key: `public/speakers/${speaker.photo.name}`,
        }

        const command = new DeleteObjectCommand(params)
        await s3.send(command)

        res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.OK,
            code: HTTP_STATUS.OK,
            data: { speaker },
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
