import 'dotenv/config'
import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { closeDatabase, connectDatabase, query } from '../config/database.js'
import { createShipment, deleteShipment, getShipment, updateShipment } from '../services/shipmentService.js'
import { createUser } from '../models/User.js'

const shipmentData = {
  sender: { name: 'Sender', phone: '+123456789', address: '1 Harbor Road' },
  receiver: { name: 'Receiver', phone: '+987654321', address: '2 Port Street' },
  cargo: { type: 'Equipment', description: 'Test shipment', quantity: 2, weight: 18.5 },
  origin: 'Port A',
  destination: 'Port B',
}

test('PostgreSQL shipment read, update, and delete enforce ownership', {
  skip: !process.env.DATABASE_URL,
}, async () => {
  await connectDatabase()
  const createdUsers = []
  let shipmentId

  try {
    const owner = await createUser({
      name: 'CRUD Owner',
      email: `crud-owner-${randomUUID()}@example.invalid`,
      passwordHash: 'test-password-hash',
      role: 'customer',
    })
    createdUsers.push(owner.id)

    const otherUser = await createUser({
      name: 'CRUD Other User',
      email: `crud-other-${randomUUID()}@example.invalid`,
      passwordHash: 'test-password-hash',
      role: 'customer',
    })
    createdUsers.push(otherUser.id)

    const shipment = await createShipment(owner.id, shipmentData)
    shipmentId = shipment.id

    assert.equal((await getShipment(shipmentId, owner)).id, shipmentId)
    assert.equal(await getShipment(shipmentId, otherUser), null)
    assert.equal(await updateShipment(shipmentId, otherUser, shipmentData), null)
    assert.equal(await deleteShipment(shipmentId, otherUser), false)

    const updated = await updateShipment(shipmentId, owner, {
      ...shipmentData,
      origin: 'Updated Port',
    })
    assert.equal(updated.origin, 'Updated Port')
    assert.equal(updated.status, 'Pending')

    assert.equal(await deleteShipment(shipmentId, owner), true)
    assert.equal(await getShipment(shipmentId, owner), null)
  } finally {
    if (shipmentId) {
      await query('DELETE FROM shipments WHERE id = $1', [shipmentId])
    }
    if (createdUsers.length) {
      await query('DELETE FROM users WHERE id = ANY($1::uuid[])', [createdUsers])
    }
    await closeDatabase()
  }
})
