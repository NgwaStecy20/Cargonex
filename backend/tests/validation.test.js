import test from 'node:test'
import assert from 'node:assert/strict'
import { validateLogin, validateRegistration, validateShipment } from '../utils/validation.js'

const validShipment = {
  sender: { name: 'Sender', phone: '+123456789', address: '1 Harbor Road' },
  receiver: { name: 'Receiver', phone: '+987654321', address: '2 Port Street' },
  cargo: { type: 'Equipment', description: 'Packing equipment', quantity: 2, weight: 18.5 },
  origin: 'Port A',
  destination: 'Port B',
}

test('registration normalizes email and never accepts a caller-selected role', () => {
  const result = validateRegistration({
    name: '  Ada Example ',
    email: ' ADA@example.com ',
    password: 'secure pass 123',
    role: 'administrator',
  })

  assert.deepEqual(result, {
    name: 'Ada Example',
    email: 'ada@example.com',
    password: 'secure pass 123',
  })
})

test('registration rejects malformed email and weak password', () => {
  assert.throws(
    () => validateRegistration({ name: 'A', email: 'not-an-email', password: 'short' }),
    (error) => error.statusCode === 400 && Boolean(error.details.email) && Boolean(error.details.password),
  )
})

test('login requires an email and password', () => {
  assert.throws(() => validateLogin({ email: 'person@example.com' }), { statusCode: 400 })
})

test('shipment validation accepts valid details and rejects invalid quantities', () => {
  assert.deepEqual(validateShipment(validShipment), validShipment)
  assert.throws(
    () => validateShipment({ ...validShipment, cargo: { ...validShipment.cargo, quantity: true } }),
    (error) => error.statusCode === 400 && Boolean(error.details['cargo.quantity']),
  )
})

test('shipment validation rejects missing sender, receiver, cargo and route details', () => {
  assert.throws(
    () => validateShipment({ sender: {}, receiver: {}, cargo: {}, origin: '', destination: '' }),
    (error) => error.statusCode === 400 && Boolean(error.details['cargo.weight']),
  )
})
