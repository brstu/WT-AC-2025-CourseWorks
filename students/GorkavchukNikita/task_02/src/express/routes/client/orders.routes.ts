import { Router } from 'express'
import { requireAuth } from '../../middlewares/require-auth.middleware'
import { getUserOrders } from '../../controllers/client/orders.controller'

const router = Router()

router.get('/', requireAuth, getUserOrders)

export default router
