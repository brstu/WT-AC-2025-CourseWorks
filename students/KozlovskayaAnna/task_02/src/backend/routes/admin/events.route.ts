import { Router } from 'express'
import multer from 'multer'

import {
    createEvent,
    deleteEvent,
    getEvent,
    patchEvent,
} from '../../controllers/admin/events.controller'
import { requireAuth } from '../../middlewares/require-auth.middleware'

import { checkAdmin } from '../../middlewares/check-admin.middleware'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = Router()

router.post('/', requireAuth, checkAdmin, upload.single('cover'), createEvent)
router.get('/:id', requireAuth, checkAdmin, getEvent)
router.patch('/:id', requireAuth, checkAdmin, upload.single('cover'), patchEvent)
router.delete('/:id', requireAuth, checkAdmin, deleteEvent)

export default router
