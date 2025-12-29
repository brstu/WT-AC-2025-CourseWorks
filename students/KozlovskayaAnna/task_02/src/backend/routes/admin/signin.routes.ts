import { Router } from 'express'
import { signin } from '../../controllers/admin/users.controller'

const router = Router()

router.post('/', signin)

export default router
