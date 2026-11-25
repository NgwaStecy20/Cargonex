import { AppError } from '../utils/AppError.js'
import { validateLogin, validateRegistration } from '../utils/validation.js'
import {
  authenticateUser,
  createAuthToken,
  registerCustomer,
  serializeUser,
} from '../services/authService.js'

const SESSION_MAX_AGE = 8 * 60 * 60 * 1000

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  }
}

export async function register(req, res) {
  const input = validateRegistration(req.body)
  const user = await registerCustomer(input)
  res.status(201).json({
    message: 'Your customer account has been created. Please sign in.',
    user: serializeUser(user),
  })
}

export async function login(req, res) {
  const credentials = validateLogin(req.body)
  const user = await authenticateUser(credentials)
  const token = createAuthToken(user)
  res.cookie('cargonex_session', token, { ...getCookieOptions(), maxAge: SESSION_MAX_AGE })
  res.json({ user: serializeUser(user) })
}

export function logout(_req, res) {
  res.clearCookie('cargonex_session', getCookieOptions())
  res.status(204).end()
}

export function currentUser(req, res) {
  if (!req.user) throw new AppError('Authentication is required.', 401)
  res.json({ user: serializeUser(req.user) })
}
