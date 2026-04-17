import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import '../css/student/Dashboard.css'

const NAV_TILES = [
  {
    id: 'lessons',
    label: 'Lessons',
    path: '/student/lessons',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  {
    id: 'tests',
    label: 'Tests',
    path: '/student/tests',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'My Progress',
    path: '/student/progress',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    id: 'class',
    label: 'My Class',
    path: '/student/my-class',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'support',
    label: 'Support',
    path: '/student/support',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
]

const SPRING = [0.16, 1, 0.3, 1]
const LEAVE  = { duration: 0.3, ease: [0, 0, 0.2, 1] }

const tileVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i, 6) * 0.04 + 0.52,
      duration: 0.38,
      ease: SPRING,
    },
  }),
}

export default function StudentDashboard() {
  const navigate      = useNavigate()
  const { user, logout } = useAuth()
  const [uiLeaving,   setUiLeaving]   = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const handleLogout = () => {
    setUiLeaving(true)
    // 350ms slide-out + ~1000ms bg-only hold
    setTimeout(() => setTransitioning(true), 1350)
  }

  const handleTransitionEnd = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <video className="dashboard-bg" autoPlay muted loop playsInline src="/shipInThePortToshipInThePort.mp4" />
      <div className="dashboard-overlay" />

      {/* ── Role badge ───────────────────────────────────────────────────────── */}
      <motion.div
        className="dash-role-badge"
        initial={{ opacity: 0, y: -10 }}
        animate={uiLeaving ? { opacity: 0, x: -20 } : { opacity: 1, y: 0 }}
        transition={uiLeaving ? LEAVE : { duration: 0.48, ease: SPRING, delay: 0.35 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
        <span>Student</span>
      </motion.div>

      {/* ── Controls ─────────────────────────────────────────────────────────── */}
      <motion.div
        className="dash-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={uiLeaving ? { opacity: 0, x: -20 } : { opacity: 1, y: 0 }}
        transition={uiLeaving ? LEAVE : { duration: 0.48, ease: SPRING, delay: 0.4 }}
      >
        <button className="ctrl-btn" type="button" onClick={() => navigate('/student/profile')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </button>
        <div className="ctrl-divider" aria-hidden="true" />
        <button className="ctrl-btn ctrl-btn--danger" type="button" onClick={handleLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Log out
        </button>
      </motion.div>

      {/* ── Center content ────────────────────────────────────────────────────── */}
      <motion.main
        className="dash-main"
        initial={{ opacity: 1, x: 0 }}
        animate={uiLeaving ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
        transition={uiLeaving ? LEAVE : {}}
      >
        <motion.div
          className="dash-brand"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: SPRING, delay: 0.45 }}
        >
          <span className="dash-wordmark">SEAFARER</span>
          <div className="dash-brand-divider" aria-hidden="true" />
          <p className="dash-greeting">
            Welcome back,{' '}
            <span className="dash-username">{user?.username ?? 'Student'}</span>
          </p>
        </motion.div>

        <nav className="dash-grid" aria-label="Student navigation">
          <div className="dash-row">
            {NAV_TILES.slice(0, 3).map((tile, i) => (
              <motion.button
                key={tile.id}
                className="nav-tile"
                custom={i}
                variants={tileVariants}
                initial="hidden"
                animate="show"
                whileHover={{ y: -3, transition: { duration: 0.22, ease: SPRING } }}
                whileTap={{ y: -1, transition: { duration: 0.1 } }}
                type="button"
                onClick={() => navigate(tile.path)}
              >
                <span className="nav-tile-icon" aria-hidden="true">{tile.icon}</span>
                <span className="nav-tile-label">{tile.label}</span>
              </motion.button>
            ))}
          </div>
          <div className="dash-row">
            {NAV_TILES.slice(3).map((tile, i) => (
              <motion.button
                key={tile.id}
                className="nav-tile"
                custom={i + 3}
                variants={tileVariants}
                initial="hidden"
                animate="show"
                whileHover={{ y: -3, transition: { duration: 0.22, ease: SPRING } }}
                whileTap={{ y: -1, transition: { duration: 0.1 } }}
                type="button"
                onClick={() => navigate(tile.path)}
              >
                <span className="nav-tile-icon" aria-hidden="true">{tile.icon}</span>
                <span className="nav-tile-label">{tile.label}</span>
              </motion.button>
            ))}
          </div>
        </nav>
      </motion.main>

      {/* ── Logout transition overlay ─────────────────────────────────────────── */}
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
