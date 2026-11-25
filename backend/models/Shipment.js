import { query } from '../config/database.js'

function mapShipment(row) {
  if (!row) return null
  return {
    id: row.id,
    sender: row.sender,
    receiver: row.receiver,
    cargo: row.cargo,
    origin: row.origin,
    destination: row.destination,
    status: row.status,
    trackingNumber: row.trackingNumber,
    createdAt: row.createdAt,
    ...(row.userId ? {
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
      },
    } : {}),
  }
}

const shipmentColumns = `
  shipments.id, shipments.sender, shipments.receiver, shipments.cargo,
  shipments.origin, shipments.destination, shipments.status,
  shipments.tracking_number AS "trackingNumber",
  shipments.created_at AS "createdAt"
`

export async function createShipmentRecord({ userId, sender, receiver, cargo, origin, destination }) {
  const { rows } = await query(
    `INSERT INTO shipments (user_id, sender, receiver, cargo, origin, destination)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, sender, receiver, cargo, origin, destination, status,
       tracking_number AS "trackingNumber", created_at AS "createdAt"`,
    [userId, sender, receiver, cargo, origin, destination],
  )
  return mapShipment(rows[0])
}

export async function findShipmentsByUserId(userId) {
  const { rows } = await query(
    `SELECT ${shipmentColumns}
     FROM shipments
     WHERE shipments.user_id = $1
     ORDER BY shipments.created_at DESC`,
    [userId],
  )
  return rows.map(mapShipment)
}

export async function findShipmentById(id) {
  const { rows } = await query(
    `SELECT ${shipmentColumns},
       users.id AS "userId", users.name AS "userName", users.email AS "userEmail"
     FROM shipments
     JOIN users ON users.id = shipments.user_id
     WHERE shipments.id = $1`,
    [id],
  )
  return mapShipment(rows[0])
}

export async function findAllShipments() {
  const { rows } = await query(
    `SELECT ${shipmentColumns},
       users.id AS "userId", users.name AS "userName", users.email AS "userEmail"
     FROM shipments
     JOIN users ON users.id = shipments.user_id
     ORDER BY shipments.created_at DESC`,
  )
  return rows.map(mapShipment)
}

export async function updateShipmentRecord({ id, userId, canManageAll, sender, receiver, cargo, origin, destination }) {
  const { rows } = await query(
    `UPDATE shipments
     SET sender = $4, receiver = $5, cargo = $6, origin = $7, destination = $8
     WHERE id = $1 AND ($2::boolean OR user_id = $3)
     RETURNING id, sender, receiver, cargo, origin, destination, status,
       tracking_number AS "trackingNumber", created_at AS "createdAt"`,
    [id, canManageAll, userId, sender, receiver, cargo, origin, destination],
  )
  return mapShipment(rows[0])
}

export async function deleteShipmentRecord({ id, userId, canManageAll }) {
  const { rows } = await query(
    `DELETE FROM shipments
     WHERE id = $1 AND ($2::boolean OR user_id = $3)
     RETURNING id`,
    [id, canManageAll, userId],
  )
  return rows.length > 0
}
