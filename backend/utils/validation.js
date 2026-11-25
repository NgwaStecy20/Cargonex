import { AppError } from './AppError.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(`${label} must be an object.`, 400)
  }
}

export function validateRegistration(body) {
  requireObject(body, 'Registration data')
  const details = {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (name.length < 2 || name.length > 100) {
    details.name = 'Name must be between 2 and 100 characters.'
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    details.email = 'Enter a valid email address.'
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    details.password = 'Password must be at least 8 characters and no more than 72 bytes.'
  }
  if (Object.keys(details).length) {
    throw new AppError('Please correct the registration details.', 400, details)
  }
  return { name, email, password }
}

export function validateLogin(body) {
  requireObject(body, 'Login data')
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400)
  }
  return { email, password }
}

function requiredText(value, field, maxLength, details) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > maxLength) {
    details[field] = `This field is required and must be no more than ${maxLength} characters.`
  }
  return text
}

export function validateShipment(body) {
  requireObject(body, 'Shipment data')
  const details = {}
  for (const section of ['sender', 'receiver', 'cargo']) {
    if (!body[section] || typeof body[section] !== 'object' || Array.isArray(body[section])) {
      details[section] = 'This section is required.'
    }
  }
  if (Object.keys(details).length) {
    throw new AppError('Please provide all required shipment information.', 400, details)
  }

  const sender = {
    name: requiredText(body.sender.name, 'sender.name', 100, details),
    phone: requiredText(body.sender.phone, 'sender.phone', 30, details),
    address: requiredText(body.sender.address, 'sender.address', 200, details),
  }
  const receiver = {
    name: requiredText(body.receiver.name, 'receiver.name', 100, details),
    phone: requiredText(body.receiver.phone, 'receiver.phone', 30, details),
    address: requiredText(body.receiver.address, 'receiver.address', 200, details),
  }
  const cargoType = requiredText(body.cargo.type, 'cargo.type', 80, details)
  const description = requiredText(body.cargo.description, 'cargo.description', 1000, details)
  const origin = requiredText(body.origin, 'origin', 120, details)
  const destination = requiredText(body.destination, 'destination', 120, details)
  const quantity = body.cargo.quantity
  const weight = body.cargo.weight

  if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) {
    details['cargo.quantity'] = 'Quantity must be a positive whole number.'
  }
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0 || weight > 1000000) {
    details['cargo.weight'] = 'Weight must be greater than zero and at most 1,000,000 kg.'
  }
  if (Object.keys(details).length) {
    throw new AppError('Please correct the shipment details.', 400, details)
  }

  return {
    sender,
    receiver,
    cargo: { type: cargoType, description, quantity, weight },
    origin,
    destination,
  }
}
