import { query } from '../config/database.js'

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    ...(row.passwordHash !== undefined ? { passwordHash: row.passwordHash } : {}),
    role: row.role,
    createdAt: row.createdAt,
  }
}

export async function createUser({ name, email, passwordHash, role }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, password_hash AS "passwordHash", role, created_at AS "createdAt"`,
    [name, email, passwordHash, role],
  )
  return mapUser(rows[0])
}

export async function findUserByEmail(email, { includePasswordHash = false } = {}) {
  const passwordColumn = includePasswordHash ? ', password_hash AS "passwordHash"' : ''
  const { rows } = await query(
    `SELECT id, name, email, role, created_at AS "createdAt"${passwordColumn}
     FROM users
     WHERE email = $1`,
    [email],
  )
  return mapUser(rows[0])
}

export async function findUserById(id) {
  const { rows } = await query(
    `SELECT id, name, email, role, created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [id],
  )
  return mapUser(rows[0])
}
