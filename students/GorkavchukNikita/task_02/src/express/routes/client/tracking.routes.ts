import { Router } from 'express'
import { getTrackingByCode } from '../../controllers/client/tracking.controller'

const router = Router()

router.get('/:code', getTrackingByCode)

export default router
