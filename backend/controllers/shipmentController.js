import {
  createShipment,
  deleteShipment,
  getShipment,
  listAllShipments,
  listUserShipments,
  serializeShipment,
  updateShipment,
} from '../services/shipmentService.js'
import { validateShipment } from '../utils/validation.js'
import { AppError } from '../utils/AppError.js'

const SHIPMENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getShipmentId(req) {
  if (!SHIPMENT_ID_PATTERN.test(req.params.id)) {
    throw new AppError('The shipment identifier is invalid.', 400)
  }
  return req.params.id
}

export async function create(req, res) {
  const shipmentData = validateShipment(req.body)
  const shipment = await createShipment(req.user.id, shipmentData)
  res.status(201).json({ shipment: serializeShipment(shipment) })
}

export async function listMine(req, res) {
  const shipments = await listUserShipments(req.user.id)
  res.json({ shipments: shipments.map(serializeShipment) })
}

export async function listAll(_req, res) {
  const shipments = await listAllShipments()
  res.json({ shipments: shipments.map(serializeShipment) })
}

export async function read(req, res) {
  const shipment = await getShipment(getShipmentId(req), req.user)
  if (!shipment) {
    throw new AppError('The requested shipment was not found.', 404)
  }
  res.json({ shipment: serializeShipment(shipment) })
}

export async function update(req, res) {
  const shipmentData = validateShipment(req.body)
  const shipment = await updateShipment(getShipmentId(req), req.user, shipmentData)
  if (!shipment) {
    throw new AppError('The requested shipment was not found.', 404)
  }
  res.json({ shipment: serializeShipment(shipment) })
}

export async function remove(req, res) {
  const deleted = await deleteShipment(getShipmentId(req), req.user)
  if (!deleted) {
    throw new AppError('The requested shipment was not found.', 404)
  }
  res.status(204).end()
}
