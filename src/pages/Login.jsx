import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import './css/Login.css'

// phase: 'idle' → 'leaving' → [bg holds ~1s] → 'transitioning' → navigate
export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [phase, setPhase]       = useState('idle')
  const [role, setRole]         = useState(null)
  const transitionVideoRef      = useRef(null)
  const navigate                = useNavigate()
  const { login }               = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields')
      return
    }
    try {
      const userRole = await login(username, password)
      setError('')
      setRole(userRole)
      setPhase('leaving')
      // 380ms slide-out + ~1000ms bg-only hold before transition video
      setTimeout(() => setPhase('transitioning'), 1380)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(detail || 'Invalid username or password')
    }
  }

  const handleTransitionEnd  = () => navigate(`/${role}/dashboard`)
  const handleTransitionError = () => navigate(`/${role}/dashboard`)

  return (
    <div className="login-page">
      <video
        className="login-bg"
        autoPlay muted loop playsInline
        src="/shipInTheSeaToshipInTheSea.mp4"
      />
      <div className="login-overlay" />

      <div className={`login-card${phase === 'leaving' ? ' login-card--leaving' : ''}`}>
        <div className="login-brand">
          <span className="login-logo">SEAFARER</span>
          <span className="login-tagline">Maritime VR Training</span>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <input
            className={`login-input${error ? ' login-input--error' : ''}`}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            autoComplete="username"
            disabled={phase !== 'idle'}
          />
          <div className="login-input-wrapper">
            <input
              className={`login-input${error ? ' login-input--error' : ''}`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
              disabled={phase !== 'idle'}
            />
            {error && <p className="login-error">{error}</p>}
          </div>
          <button className="login-btn" type="submit" disabled={phase !== 'idle'}>
            Sign in
          </button>
        </form>
      </div>

      {phase === 'transitioning' && (
        <div className="page-transition" onClick={handleTransitionEnd}>
          <video
            ref={transitionVideoRef}
            className="page-transition-video"
            autoPlay muted playsInline
            onEnded={handleTransitionEnd}
            onError={handleTransitionError}
            src="/shipInTheSeaToshipInThePort.mp4"
            onLoadedMetadata={(e) => { e.target.playbackRate = 2.5 }}
          />
        </div>
      )}
    </div>
  )
}
