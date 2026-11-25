const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Unable to reach the CARGONEX server. Check that the backend is running.')
  }

  if (response.status === 204) return null

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('The server returned an unreadable response.')
  }

  if (!response.ok) {
    throw new ApiError(
      payload.message || 'The request could not be completed.',
      response.status,
      payload.details,
    )
  }

  return payload
}

export const api = {
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((result) => result.user),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me').then((result) => result.user),
  createShipment: (data) => request('/shipments', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((result) => result.shipment),
  getShipment: (id) => request(`/shipments/${encodeURIComponent(id)}`).then((result) => result.shipment),
  getAllShipments: () => request('/shipments').then((result) => result.shipments),
  getMyShipments: () => request('/shipments/mine').then((result) => result.shipments),
  updateShipment: (id, data) => request(`/shipments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then((result) => result.shipment),
  deleteShipment: (id) => request(`/shipments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),
}
