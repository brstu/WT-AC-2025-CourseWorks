import { Router } from 'express'
import { getInvitations } from '../../controllers/client/invitations.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'

const router = Router()

router.get('/', requireAuth, getInvitations)

export default router
