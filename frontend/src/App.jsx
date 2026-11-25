import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import { api, ApiError } from './services/api.js'
import './App.css'
import './Auth.css'
import './Dashboard.css'

function BrandMark() {
  return (
    <a className="brand-mark" href="/" aria-label="CARGONEX home">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M5 25h30l-4 8H11z" />
        <path d="M10 12h8v10h-8zm10 0h8v10h-8zm10 0h5v10h-5z" />
        <path d="M4 35c4-2 7-2 11 0s7 2 11 0 7-2 10 0" />
      </svg>
      <span>CARGO<span>NEX</span></span>
    </a>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState('')
  const [loginMessage, setLoginMessage] = useState('')

  useEffect(() => {
    let active = true

    api.getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
          if (currentUser) setCurrentPage('dashboard')
        }
      })
      .catch((error) => {
        if (active && !(error instanceof ApiError && error.status === 401)) {
          setSessionError(error.message)
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleLogin(credentials) {
    const authenticatedUser = await api.login(credentials)
    setUser(authenticatedUser)
    setSessionError('')
    setCurrentPage('dashboard')
  }

  async function handleLogout() {
    await api.logout()
    setUser(null)
    setCurrentPage('home')
  }

  function showLogin() {
    setLoginMessage('')
    setCurrentPage('login')
  }

  if (checkingSession) {
    return <main className="app-loading" aria-live="polite">Loading CARGONEX…</main>
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  if (currentPage === 'home') {
    return (
      <>
        {sessionError && <p className="session-alert" role="status">{sessionError}</p>}
        <LandingPage onLogin={showLogin} onRegister={() => setCurrentPage('register')} />
      </>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <BrandMark />
        <div className="auth-visual-copy">
          <span className="auth-eyebrow">SHIPPING MADE SIMPLE</span>
          <h1>Your cargo.<br />Connected to the world.</h1>
          <p>One place to register shipments and keep your cargo journey organized.</p>
        </div>
        <span className="auth-visual-footer">Reliable movement starts here.</span>
      </section>
      <section className="auth-panel">
        <BrandMark />
        {currentPage === 'login' ? (
          <>
            <LoginForm onSubmit={handleLogin} />
            {loginMessage && <p className="form-message form-message--success" role="status">{loginMessage}</p>}
            <p className="auth-switch">
              New to CARGONEX?{' '}
              <button type="button" onClick={() => setCurrentPage('register')}>Create an account</button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm
              onRegistered={() => {
                setLoginMessage('Account created. Sign in to continue.')
                setCurrentPage('login')
              }}
            />
            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={showLogin}>Sign in</button>
            </p>
          </>
        )}
        <button className="auth-back" type="button" onClick={() => setCurrentPage('home')}>
          ← Back to home
        </button>
      </section>
    </main>
  )
}

export default App
