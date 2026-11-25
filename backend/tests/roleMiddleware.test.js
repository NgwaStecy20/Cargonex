import test from 'node:test'
import assert from 'node:assert/strict'
import { allowRoles } from '../middleware/roleMiddleware.js'

function runRoleCheck(role, allowedRoles) {
  const req = { user: role ? { role } : null }
  let nextError
  try {
    allowRoles(...allowedRoles)(req, {}, (error) => {
      nextError = error
    })
  } catch (error) {
    return error
  }
  return nextError
}

test('role middleware allows an explicitly permitted role', () => {
  assert.equal(runRoleCheck('shipping_staff', ['shipping_staff', 'administrator']), undefined)
})

test('role middleware rejects unauthenticated and insufficient roles', () => {
  assert.equal(runRoleCheck(null, ['customer'])?.statusCode, 403)
  assert.equal(runRoleCheck('customer', ['shipping_staff'])?.statusCode, 403)
})
