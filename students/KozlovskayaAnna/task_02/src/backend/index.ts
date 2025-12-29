import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Client Routes
import healthClientRouter from './routes/client/health.routes'
import userClientRouter from './routes/client/user.routes'
import eventsClientRouter from './routes/client/events.routes'
import invitationClientRouter from './routes/client/invitations.routes'
import ticketsClientRouter from './routes/client/tickets.routes'

// Admin Routes
import signinAdminRouter from './routes/admin/signin.routes'
import usersAdminRouter from './routes/admin/users.routes'
import speakerAdminRoutes from './routes/admin/speaker.routes'
import eventsAdminRoutes from './routes/admin/events.route'

import { logger } from './middlewares/logger.middleware'

import { COMMON_ERRORS } from './constants/errors'
import { HTTP_STATUS } from './constants/http-status'
import { RESPONSE_STATUS } from './constants/response-status'

const app = express()
app.use(
    cors({
        origin: ['http://localhost:3000', 'https://zafid-frontend.vercel.app'],
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.use(logger)

// Client Routes
app.use('/api/health', healthClientRouter)
app.use('/api/user', userClientRouter)
app.use('/api/events', eventsClientRouter)
app.use('/api/invitations', invitationClientRouter)
app.use('/api/tickets', ticketsClientRouter)

// Admin Routes
app.use('/api/admin/signin', signinAdminRouter)
app.use('/api/admin/users', usersAdminRouter)
app.use('/api/admin/speakers', speakerAdminRoutes)
app.use('/api/admin/events', eventsAdminRoutes)

app.use((_: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_STATUS.ERROR,
        message: COMMON_ERRORS.ROUTE_NOT_FOUND,
        code: HTTP_STATUS.NOT_FOUND,
    })
})

mongoose
    .connect(process.env.MONGO_URI || '')
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: ${process.env.PORT}`)
        })
    })
    .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : COMMON_ERRORS.UNEXPECTED
        console.log('Error:', msg)
    })
