import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail } from '../models/User.js'
import { AppError } from '../utils/AppError.js'

const BCRYPT_ROUNDS = 12
const TOKEN_LIFETIME = '8h'

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.')
  }
  return secret
}

export async function registerCustomer({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  try {
    return await createUser({ name, email, passwordHash, role: 'customer' })
  } catch (error) {
    if (error?.code === '23505') {
      throw new AppError('An account with this email already exists.', 409)
    }
    throw error
  }
}

export async function authenticateUser({ email, password }) {
  const user = await findUserByEmail(email, { includePasswordHash: true })
  const validPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, '$2b$12$C6UzMDM.H6dfI/f/IKcEe.8UUz5LVTfuyNYw/7K4ZCQzZ9I2R1l7W')

  if (!user || !validPassword) {
    throw new AppError('Invalid email or password.', 401)
  }
  return user
}

export function createAuthToken(user) {
  return jwt.sign({ sub: user.id }, getJwtSecret(), { expiresIn: TOKEN_LIFETIME })
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret())
}

export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
}
