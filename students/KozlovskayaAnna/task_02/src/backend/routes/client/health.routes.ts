import { Router } from 'express'
import { getHealth, postPing } from '../../controllers/client/health.controller'

const router = Router()

router.get('/', getHealth)
router.post('/', postPing)

export default router
