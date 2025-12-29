import { Router } from 'express'
import { getTickets, getTicket } from '../../controllers/client/ticket.controller'
import { requireAuth } from '../../middlewares/require-auth.middleware'

const router = Router()

router.get('/', requireAuth, getTickets)
router.get('/:id', requireAuth, getTicket)

export default router
