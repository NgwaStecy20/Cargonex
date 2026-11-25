import {
  createShipmentRecord,
  findAllShipments,
  findShipmentById,
  findShipmentsByUserId,
  updateShipmentRecord,
  deleteShipmentRecord,
} from '../models/Shipment.js'

const PRIVILEGED_ROLES = new Set(['shipping_staff', 'administrator'])

export async function createShipment(userId, shipmentData) {
  return createShipmentRecord({
    ...shipmentData,
    userId,
  })
}

export async function listUserShipments(userId) {
  return findShipmentsByUserId(userId)
}

export async function listAllShipments() {
  return findAllShipments()
}

export async function getShipment(id, user) {
  const shipment = await findShipmentById(id)
  if (!shipment || (!PRIVILEGED_ROLES.has(user.role) && shipment.user.id !== user.id)) {
    return null
  }
  return shipment
}

export async function updateShipment(id, user, shipmentData) {
  return updateShipmentRecord({
    id,
    userId: user.id,
    canManageAll: PRIVILEGED_ROLES.has(user.role),
    ...shipmentData,
  })
}

export async function deleteShipment(id, user) {
  return deleteShipmentRecord({
    id,
    userId: user.id,
    canManageAll: PRIVILEGED_ROLES.has(user.role),
  })
}

export function serializeShipment(shipment) {
  return {
    id: shipment.id,
    sender: shipment.sender,
    receiver: shipment.receiver,
    cargo: shipment.cargo,
    origin: shipment.origin,
    destination: shipment.destination,
    status: shipment.status,
    ...(shipment.trackingNumber ? { trackingNumber: shipment.trackingNumber } : {}),
    createdAt: shipment.createdAt,
    ...(shipment.user && typeof shipment.user === 'object'
      ? { createdBy: { id: shipment.user.id, name: shipment.user.name, email: shipment.user.email } }
      : {}),
  }
}
