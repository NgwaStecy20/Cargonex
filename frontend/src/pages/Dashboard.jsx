import { useCallback, useEffect, useState } from 'react'
import ShipmentForm from '../components/ShipmentForm.jsx'
import { api } from '../services/api.js'

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function Dashboard({ user, onLogout }) {
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [editingShipment, setEditingShipment] = useState(null)
  const [loadingShipmentId, setLoadingShipmentId] = useState(null)
  const [deletingShipmentId, setDeletingShipmentId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const canViewAllShipments = user.role === 'shipping_staff' || user.role === 'administrator'

  const loadShipments = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      setShipments(await (canViewAllShipments ? api.getAllShipments() : api.getMyShipments()))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }, [canViewAllShipments])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) loadShipments()
    })
    return () => {
      active = false
    }
  }, [loadShipments])

  async function handleLogout() {
    setLogoutError('')
    setIsLoggingOut(true)
    try {
      await onLogout()
    } catch (error) {
      setLogoutError(error.message)
      setIsLoggingOut(false)
    }
  }

  async function handleViewShipment(id) {
    if (selectedShipment?.id === id) {
      setSelectedShipment(null)
      return
    }

    setActionError('')
    setEditingShipment(null)
    setLoadingShipmentId(id)
    try {
      setSelectedShipment(await api.getShipment(id))
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setLoadingShipmentId(null)
    }
  }

  async function handleEditShipment(id) {
    setActionError('')
    setSelectedShipment(null)
    setLoadingShipmentId(id)
    try {
      setEditingShipment(await api.getShipment(id))
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setLoadingShipmentId(null)
    }
  }

  async function handleDeleteShipment(id) {
    if (!window.confirm('Delete this shipment? This action cannot be undone.')) return

    setActionError('')
    setDeletingShipmentId(id)
    try {
      await api.deleteShipment(id)
      setSelectedShipment(null)
      setEditingShipment(null)
      await loadShipments()
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setDeletingShipmentId(null)
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/" aria-label="CARGONEX dashboard">
          CARGO<span>NEX</span>
        </a>
        <div className="dashboard-account">
          <div>
            <span className="account-label">SIGNED IN AS</span>
            <strong>{user.name}</strong>
          </div>
          <button className="secondary-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="dashboard-intro">
          <span className="auth-eyebrow">YOUR SHIPPING WORKSPACE</span>
          <h1>Welcome, {user.name.split(' ')[0]}</h1>
          <p>Register a shipment and keep your shipment records together in one place.</p>
        </section>

        {logoutError && <p className="form-message form-message--error" role="alert">{logoutError}</p>}

        <div className="dashboard-grid">
          <section className="dashboard-card shipment-create-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">NEW SHIPMENT</span>
                <h2>Shipment details</h2>
              </div>
              <span className="section-icon" aria-hidden="true">＋</span>
            </div>
            <ShipmentForm onCreated={loadShipments} />
          </section>

          <section className="dashboard-card shipments-card">
            <div className="section-heading">
              <div>
                <span className="section-kicker">{canViewAllShipments ? 'SHIPMENT RECORDS' : 'YOUR RECORDS'}</span>
                <h2>{canViewAllShipments ? 'All shipments' : 'My shipments'}</h2>
              </div>
              <span className="shipment-count">{shipments.length}</span>
            </div>

            {actionError && <p className="form-message form-message--error" role="alert">{actionError}</p>}

            {isLoading ? (
              <p className="empty-state">Loading shipments…</p>
            ) : error ? (
              <p className="form-message form-message--error" role="alert">{error}</p>
            ) : shipments.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon" aria-hidden="true">▤</span>
                <strong>No shipments yet</strong>
                <p>Registered shipments will appear here.</p>
              </div>
            ) : (
              <ul className="shipment-list">
                {shipments.map((shipment) => (
                  <li className="shipment-item" key={shipment.id}>
                    <div className="shipment-item-heading">
                      <strong>{shipment.cargo.type}</strong>
                      <span className="status-pill">{shipment.status}</span>
                    </div>
                    <p className="shipment-route">
                      <span>{shipment.origin}</span>
                      <span aria-hidden="true">→</span>
                      <span>{shipment.destination}</span>
                    </p>
                    <div className="shipment-meta">
                      <span>{shipment.cargo.quantity} item{shipment.cargo.quantity === 1 ? '' : 's'}</span>
                      <span>{shipment.cargo.weight} kg</span>
                      <span>{formatDate(shipment.createdAt)}</span>
                    </div>
                    <p className="shipment-contact">
                      To: {shipment.receiver.name}
                    </p>
                    <div className="shipment-actions">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleViewShipment(shipment.id)}
                        disabled={loadingShipmentId === shipment.id || deletingShipmentId === shipment.id}
                      >
                        {loadingShipmentId === shipment.id
                          ? 'Loading…'
                          : (selectedShipment?.id === shipment.id ? 'Hide details' : 'View details')}
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleEditShipment(shipment.id)}
                        disabled={loadingShipmentId === shipment.id || deletingShipmentId === shipment.id}
                      >
                        {loadingShipmentId === shipment.id && editingShipment?.id !== shipment.id ? 'Loading…' : 'Edit'}
                      </button>
                      <button
                        className="secondary-button shipment-delete-button"
                        type="button"
                        onClick={() => handleDeleteShipment(shipment.id)}
                        disabled={deletingShipmentId === shipment.id || loadingShipmentId === shipment.id}
                      >
                        {deletingShipmentId === shipment.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                    {selectedShipment?.id === shipment.id && (
                      <section className="shipment-expanded-details" aria-label="Shipment details">
                        <div>
                          <strong>Sender</strong>
                          <span>{selectedShipment.sender.name} · {selectedShipment.sender.phone}</span>
                          <span>{selectedShipment.sender.address}</span>
                        </div>
                        <div>
                          <strong>Receiver</strong>
                          <span>{selectedShipment.receiver.name} · {selectedShipment.receiver.phone}</span>
                          <span>{selectedShipment.receiver.address}</span>
                        </div>
                        <div>
                          <strong>Cargo details</strong>
                          <span>{selectedShipment.cargo.description}</span>
                          {selectedShipment.trackingNumber && <span>Tracking: {selectedShipment.trackingNumber}</span>}
                        </div>
                        {selectedShipment.createdBy && (
                          <div>
                            <strong>Registered by</strong>
                            <span>{selectedShipment.createdBy.name} · {selectedShipment.createdBy.email}</span>
                          </div>
                        )}
                      </section>
                    )}
                    {editingShipment?.id === shipment.id && (
                      <div className="shipment-edit-panel">
                        <h3>Edit shipment details</h3>
                        <ShipmentForm
                          key={editingShipment.id}
                          shipment={editingShipment}
                          onUpdated={async () => {
                            setEditingShipment(null)
                            await loadShipments()
                          }}
                          onCancel={() => setEditingShipment(null)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
