import { Router } from 'express'

import {
    createEvent,
    createOrder,
    deleteEvent,
    getEvent,
    getOrderEvents,
    patchEvent,
    getAllOrders,
    getOrder,
    patchOrder,
    deleteOrder,
} from '../../controllers/admin/orders.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const router = Router()

router.post('/', requireAuth, checkAdmin, createOrder)
router.get('/', requireAuth, checkAdmin, getAllOrders)
router.get('/:id', requireAuth, checkAdmin, getOrder)
router.patch('/:id', requireAuth, checkAdmin, patchOrder)
router.delete('/:id', requireAuth, checkAdmin, deleteOrder)
// Events
router.post('/:oid/event', requireAuth, checkAdmin, createEvent)
router.get('/:oid/event/:id', requireAuth, checkAdmin, getEvent)
router.get('/:oid/event/', requireAuth, checkAdmin, getOrderEvents)
router.patch('/:oid/event/:id', requireAuth, checkAdmin, patchEvent)
router.delete('/:oid/event/:id', requireAuth, checkAdmin, deleteEvent)

export default router
