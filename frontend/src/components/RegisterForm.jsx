import { useState } from 'react'
import { api } from '../services/api.js'

function RegisterForm({ onRegistered }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return;
    }
    setIsSubmitting(true)
    try {
      await api.register({ name: fullName.trim(), email: email.trim(), password })
      onRegistered()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <span className="auth-eyebrow">GET STARTED</span>
      <h2>Create your account</h2>
      <p className="auth-description">Join CARGONEX to register and manage your shipments.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          maxLength="100"
          placeholder="Your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          maxLength="254"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="register-password">Password</label>
        <div className="password-field">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            minLength="8"
            maxLength="72"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <label htmlFor="register-confirm-password">Confirm password</label>
        <input
          id="register-confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          minLength="8"
          maxLength="72"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

export default RegisterForm