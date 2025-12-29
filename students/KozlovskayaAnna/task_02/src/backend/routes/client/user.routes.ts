import { Router } from 'express'
import { signin, signup, profile, role, logout } from '../../controllers/client/user.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'

const router = Router()

router.post('/signup', signup)
router.post('/signin', signin)
router.post('/logout', logout)
router.get('/profile', requireAuth, profile)
router.get('/role', requireAuth, role)

export default router
