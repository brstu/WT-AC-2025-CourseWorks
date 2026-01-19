import { Router } from 'express'

import {
    getAllCountries,
    getCountry,
    createCountry,
    patchCountry,
    deleteCountry,
} from '../../controllers/admin/countries.controller'

import { requireAuth } from '../../middlewares/require-auth.middleware'
import { checkAdmin } from '../../middlewares/check-admin.middleware'

const router = Router()

router.get('/', requireAuth, checkAdmin, getAllCountries)
router.get('/:id', requireAuth, checkAdmin, getCountry)
router.post('/', requireAuth, checkAdmin, createCountry)
router.patch('/:id', requireAuth, checkAdmin, patchCountry)
router.delete('/:id', requireAuth, checkAdmin, deleteCountry)

export default router
