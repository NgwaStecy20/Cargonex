import { useState } from 'react'

function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({ email: email.trim(), password })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <span className="auth-eyebrow">WELCOME BACK</span>
      <h2>Sign in to your account</h2>
      <p className="auth-description">Enter your details to continue to CARGONEX.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="login-password">Password</label>
        <div className="password-field">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {error && <p className="form-message form-message--error" role="alert">{error}</p>}
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default LoginForm