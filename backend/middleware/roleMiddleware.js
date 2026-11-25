import { AppError } from '../utils/AppError.js'

export function allowRoles(...roles) {
  return function requireRole(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action.', 403)
    }
    next()
  }
}
