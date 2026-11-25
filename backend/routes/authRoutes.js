import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { currentUser, login, logout, register } from '../controllers/authController.js'
import { requireAuthentication } from '../middleware/authMiddleware.js'

const router = Router()
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Try again later.' },
})

router.post('/register', loginLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAuthentication, currentUser)

export default router
