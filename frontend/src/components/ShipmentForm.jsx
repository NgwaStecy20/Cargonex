import { useState } from 'react'
import { api } from '../services/api.js'

const initialForm = {
  sender: { name: '', phone: '', address: '' },
  receiver: { name: '', phone: '', address: '' },
  cargo: { type: '', description: '', quantity: '1', weight: '' },
  origin: '',
  destination: '',
}

function getShipmentForm(shipment) {
  return {
    sender: { ...shipment.sender },
    receiver: { ...shipment.receiver },
    cargo: {
      ...shipment.cargo,
      quantity: String(shipment.cargo.quantity),
      weight: String(shipment.cargo.weight),
    },
    origin: shipment.origin,
    destination: shipment.destination,
  }
}

function ShipmentForm({ shipment, onCreated, onUpdated, onCancel }) {
  const isEditing = Boolean(shipment)
  const [form, setForm] = useState(() => (shipment ? getShipmentForm(shipment) : initialForm))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(group, field, value) {
    if (group) {
      setForm((current) => ({
        ...current,
        [group]: { ...current[group], [field]: value },
      }))
    } else {
      setForm((current) => ({ ...current, [field]: value }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      const shipmentData = {
        ...form,
        cargo: {
          ...form.cargo,
          quantity: Number(form.cargo.quantity),
          weight: Number(form.cargo.weight),
        },
      }
      if (isEditing) {
        await api.updateShipment(shipment.id, shipmentData)
        setSuccess('Shipment updated.')
        await onUpdated()
      } else {
        await api.createShipment(shipmentData)
        setForm(initialForm)
        setSuccess('Shipment registered. Its status is Pending.')
        await onCreated()
      }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="shipment-form" onSubmit={handleSubmit}>
      <fieldset>
        <legend>Sender information</legend>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={form.sender.name}
              onChange={(event) => updateField('sender', 'name', event.target.value)}
              maxLength="100"
              autoComplete="name"
              required
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              value={form.sender.phone}
              onChange={(event) => updateField('sender', 'phone', event.target.value)}
              maxLength="30"
              autoComplete="tel"
              required
            />
          </label>
          <label className="field-span">
            Address
            <input
              value={form.sender.address}
              onChange={(event) => updateField('sender', 'address', event.target.value)}
              maxLength="200"
              autoComplete="street-address"
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Receiver information</legend>
        <div className="form-grid">
          <label>
            Full name
            <input
              value={form.receiver.name}
              onChange={(event) => updateField('receiver', 'name', event.target.value)}
              maxLength="100"
              required
            />
          </label>
          <label>
            Phone number
            <input
              type="tel"
              value={form.receiver.phone}
              onChange={(event) => updateField('receiver', 'phone', event.target.value)}
              maxLength="30"
              required
            />
          </label>
          <label className="field-span">
            Address
            <input
              value={form.receiver.address}
              onChange={(event) => updateField('receiver', 'address', event.target.value)}
              maxLength="200"
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Cargo and route</legend>
        <div className="form-grid">
          <label>
            Cargo type
            <input
              value={form.cargo.type}
              onChange={(event) => updateField('cargo', 'type', event.target.value)}
              maxLength="80"
              placeholder="e.g. Machinery"
              required
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max="1000000"
              step="1"
              value={form.cargo.quantity}
              onChange={(event) => updateField('cargo', 'quantity', event.target.value)}
              required
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              value={form.cargo.weight}
              onChange={(event) => updateField('cargo', 'weight', event.target.value)}
              required
            />
          </label>
          <label>
            Origin
            <input
              value={form.origin}
              onChange={(event) => updateField(null, 'origin', event.target.value)}
              maxLength="120"
              required
            />
          </label>
          <label>
            Destination
            <input
              value={form.destination}
              onChange={(event) => updateField(null, 'destination', event.target.value)}
              maxLength="120"
              required
            />
          </label>
          <label className="field-span">
            Cargo description
            <textarea
              value={form.cargo.description}
              onChange={(event) => updateField('cargo', 'description', event.target.value)}
              maxLength="1000"
              rows="3"
              required
            />
          </label>
        </div>
      </fieldset>

      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
      {success && <p className="form-message form-message--success" role="status">{success}</p>}
      <button className="auth-submit shipment-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? (isEditing ? 'Saving changes…' : 'Registering shipment…')
          : (isEditing ? 'Save changes' : 'Register shipment')}
      </button>
      {isEditing && (
        <button className="secondary-button shipment-cancel" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      )}
    </form>
  )
}

export default ShipmentForm
