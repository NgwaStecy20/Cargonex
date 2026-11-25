import { Router } from 'express'
import { create, listAll, listMine, read, remove, update } from '../controllers/shipmentController.js'
import { requireAuthentication } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = Router()
const canRegisterShipment = allowRoles('customer', 'shipping_staff', 'administrator')
const canViewAllShipments = allowRoles('shipping_staff', 'administrator')

router.use(requireAuthentication)
router.post('/', canRegisterShipment, create)
router.get('/mine', listMine)
router.get('/', canViewAllShipments, listAll)
router.get('/:id', read)
router.put('/:id', update)
router.delete('/:id', remove)

export default router
