import { findUserById } from '../models/User.js'
import { verifyAuthToken } from '../services/authService.js'
import { AppError } from '../utils/AppError.js'

export async function requireAuthentication(req, _res, next) {
  const token = req.cookies?.cargonex_session
  if (!token) {
    throw new AppError('Authentication is required.', 401)
  }

  let claims
  try {
    claims = verifyAuthToken(token)
  } catch {
    throw new AppError('Your session is invalid or has expired. Please sign in again.', 401)
  }

  const user = await findUserById(claims.sub)
  if (!user) {
    throw new AppError('Your session is no longer valid. Please sign in again.', 401)
  }
  req.user = user
  next()
}
