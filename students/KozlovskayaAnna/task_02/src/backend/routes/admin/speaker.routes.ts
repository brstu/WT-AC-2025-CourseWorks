import { Router } from 'express'
import multer from 'multer'

import {
    createSpeaker,
    deleteSpeaker,
    getAllSpeakers,
    getSpeaker,
    patchSpeaker,
} from '../../controllers/admin/speaker.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = Router()

router.post('/', requireAuth, checkAdmin, upload.single('image'), createSpeaker)
router.get('/:id', requireAuth, checkAdmin, getSpeaker)
router.get('/', requireAuth, checkAdmin, getAllSpeakers)
router.patch('/:id', requireAuth, checkAdmin, upload.single('image'), patchSpeaker)
router.delete('/:id', requireAuth, checkAdmin, deleteSpeaker)

export default router
