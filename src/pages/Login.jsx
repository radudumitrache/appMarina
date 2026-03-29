import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import './css/Login.css'

const ACCOUNTS = {
  studentTest: { password: '1234', role: 'student' },
  teacherTest: { password: '1234', role: 'teacher' },
  adminTest:   { password: '1234', role: 'admin'   },
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [role, setRole] = useState(null)
  const [error, setError] = useState('')
  const transitionVideoRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields')
      return
    }
    const account = ACCOUNTS[username]
    if (!account || account.password !== password) {
      setError('Invalid username or password')
      return
    }
    setError('')
    login(username, account.role)
    setRole(account.role)
    setTransitioning(true)
  }

  const handleTransitionEnd = () => navigate(`/${role}/dashboard`)
  const handleTransitionError = () => navigate(`/${role}/dashboard`)

  return (
    <div className="login-page">
      <video
        className="login-bg"
        autoPlay muted loop playsInline
        src="/login background .mp4"
      />
      <div className="login-overlay" />

      <div className="login-card">
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
          />
          <div className="login-input-wrapper">
            <input
              className={`login-input${error ? ' login-input--error' : ''}`}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
            />
            {error && <p className="login-error">{error}</p>}
          </div>
          <button className="login-btn" type="submit">Sign in</button>
        </form>
      </div>

      {transitioning && (
        <div className="login-transition" onClick={handleTransitionEnd}>
          <video
            ref={transitionVideoRef}
            className="login-transition-video"
            autoPlay muted playsInline
            onEnded={handleTransitionEnd}
            onError={handleTransitionError}
            src="/login_dashboard_transition.mp4"
            onLoadedMetadata={(e) => { e.target.playbackRate = 2.5 }}
          />
        </div>
      )}
    </div>
  )
}
