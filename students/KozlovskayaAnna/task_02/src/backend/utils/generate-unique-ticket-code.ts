// src/utils/generateUniqueTicketCode.ts
import type { Model } from 'mongoose'
import { generateCode } from './generate-code'
import { TICKET_ERRORS } from '../constants/errors'
import type { ITicket } from '../types/ticket'

export async function generateUniqueTicketCode(
    TicketModel: Model<ITicket>,
    maxAttempts = 10
): Promise<number> {
    let attempts = 0

    while (attempts < maxAttempts) {
        const code = generateCode()

        const exists = await TicketModel.exists({ code })

        if (!exists) {
            return code
        }

        attempts++
    }

    throw new Error(TICKET_ERRORS.FAILED_TO_GENERATE_UNIQUE_CODE)
}
