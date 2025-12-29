import { Router } from 'express'

import {
    getAllUsers,
    getUser,
    createUser,
    resetUserPassword,
    patchUser,
    deleteUser,
} from '../../controllers/admin/users.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const router = Router()

router.get('/', requireAuth, checkAdmin, getAllUsers)
router.get('/:id', requireAuth, checkAdmin, getUser)
router.post('/', requireAuth, checkAdmin, createUser)
router.post('/:id/reset-password', requireAuth, checkAdmin, resetUserPassword)
router.patch('/:id', requireAuth, checkAdmin, patchUser)
router.delete('/:id', requireAuth, checkAdmin, deleteUser)

export default router
