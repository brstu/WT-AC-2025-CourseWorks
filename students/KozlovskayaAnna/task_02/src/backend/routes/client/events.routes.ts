import { Router } from 'express'
import {
    acceptInvitation,
    createInvitation,
    declineInvitation,
    getEvent,
    getEvents,
    registerToEvent,
    unregisterFromEvent,
} from '../../controllers/client/events.controller'
import { requireAuth } from '../../middlewares/require-auth.middleware'
import { optionalAuth } from '../../middlewares/optional-auth'

const router = Router()

router.get('/:id', optionalAuth, getEvent)
router.get('/', getEvents)
router.post('/:id/atendees/', requireAuth, registerToEvent)
router.delete('/:id/atendees/', requireAuth, unregisterFromEvent)
router.post('/:id/invite/', requireAuth, createInvitation)
router.post('/:id/invite/accept', requireAuth, acceptInvitation)
router.post('/:id/invite/decline', requireAuth, declineInvitation)

export default router
