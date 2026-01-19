import { Router } from 'express'

import {
    getAllLocations,
    getLocation,
    createLocation,
    patchLocation,
    deleteLocation,
} from '../../controllers/admin/locations.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const router = Router()

router.get('/', requireAuth, checkAdmin, getAllLocations)
router.get('/:id', requireAuth, checkAdmin, getLocation)
router.post('/', requireAuth, checkAdmin, createLocation)
router.patch('/:id', requireAuth, checkAdmin, patchLocation)
router.delete('/:id', requireAuth, checkAdmin, deleteLocation)

export default router
