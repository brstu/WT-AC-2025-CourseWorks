import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Client Routes
import healthClientRouter from './routes/client/health.routes'
import userClientRouter from './routes/client/user.routes'
import trackingClientRouter from './routes/client/tracking.routes'
import clientOrdersRouter from './routes/client/orders.routes'

// Admin Routes
import usersAdminRouter from './routes/admin/users.routes'
import countryAdminRouter from './routes/admin/countries.routes'
import cityAdminRouter from './routes/admin/cities.routes'
import locationAdminRouter from './routes/admin/locations.routes'
import orderAdminRouter from './routes/admin/order.routes'

import { logger } from './middlewares/logger.middleware'

import { COMMON_ERRORS } from './constants/errors'
import { HTTP_STATUS } from './constants/http-status'
import { RESPONSE_STATUS } from './constants/response-status'

dotenv.config()

const app = express()
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
)
app.use(express.json())
app.use(cookieParser())

app.use(logger)

// Client Routes
app.use('/api/health', healthClientRouter)
app.use('/api/user', userClientRouter)
app.use('/api/tracking', trackingClientRouter)
app.use('/api/orders', clientOrdersRouter)

// Admin Routes
app.use('/api/admin/users', usersAdminRouter)
app.use('/api/admin/country', countryAdminRouter)
app.use('/api/admin/city', cityAdminRouter)
app.use('/api/admin/location', locationAdminRouter)
app.use('/api/admin/order', orderAdminRouter)

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
