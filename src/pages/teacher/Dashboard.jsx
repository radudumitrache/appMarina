import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import '../css/teacher/Dashboard.css'

const MAIN_ACTIONS = [
  {
    id: 'classes',
    label: 'My Classes',
    path: '/teacher/classes',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'builder',
    label: 'Course Builder',
    path: '/teacher/builder',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Student Progress',
    path: '/teacher/progress',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    id: 'assignments',
    label: 'Assignments',
    path: '/teacher/assignments',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    path: '/teacher/support',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [uiLeaving,    setUiLeaving]    = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const handleLogout = () => {
    setUiLeaving(true)
    setTimeout(() => setTransitioning(true), 1350)
  }

  const handleTransitionEnd = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`dashboard-page${uiLeaving ? ' dashboard-page--leaving' : ''}`}>
      <video className="dashboard-bg" autoPlay muted loop playsInline src="/shipInThePortToshipInThePort.mp4" />
      <div className="dashboard-overlay" />

      <div className="dash-role-badge">Instructor</div>

      {/* Top-left controls */}
      <div className="dash-controls">
        <button className="ctrl-btn" onClick={() => {}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </button>
        <button className="ctrl-btn ctrl-btn--logout" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log out
        </button>
      </div>

      {/* Main nav buttons */}
      <div className="dash-nav">
        {MAIN_ACTIONS.map((action, i) => (
          <button
            key={action.id}
            className="dash-btn"
            style={{ animationDelay: `${0.5 + i * 0.07}s` }}
            onClick={() => navigate(action.path)}
          >
            <span className="dash-btn-icon">{action.icon}</span>
            <span className="dash-btn-label">{action.label}</span>
          </button>
        ))}
      </div>

      {transitioning && (
        <div className="page-transition">
          <video
            className="page-transition-video"
            autoPlay muted playsInline
            onEnded={handleTransitionEnd}
            onError={handleTransitionEnd}
            src="/shipInThePortToshipInTheSea.mp4"
            onLoadedMetadata={(e) => { e.target.playbackRate = 2 }}
          />
        </div>
      )}
    </div>
  )
}
