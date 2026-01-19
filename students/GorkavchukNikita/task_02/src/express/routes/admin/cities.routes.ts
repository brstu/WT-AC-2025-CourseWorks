import { Router } from 'express'

import {
    createCity,
    deleteCity,
    getAllCities,
    getCity,
    patchCity,
} from '../../controllers/admin/cities.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const router = Router()

router.get('/', requireAuth, checkAdmin, getAllCities)
router.get('/:id', requireAuth, checkAdmin, getCity)
router.post('/', requireAuth, checkAdmin, createCity)
router.patch('/:id', requireAuth, checkAdmin, patchCity)
router.delete('/:id', requireAuth, checkAdmin, deleteCity)

export default router
