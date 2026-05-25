import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import DashControls  from '../../components/admin/dashboard/DashControls'
import DashNav       from '../../components/admin/dashboard/DashNav'
import PageTransition from '../../components/admin/dashboard/PageTransition'
import '../css/admin/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [uiLeaving,     setUiLeaving]     = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const handleLogout = () => {
    setUiLeaving(true)
    setTimeout(() => setTransitioning(true), 1350)
  }

  const handleTransitionEnd = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={`dashboard-page admin-dashboard${uiLeaving ? ' dashboard-page--leaving' : ''}`}>
      <video className="dashboard-bg" autoPlay muted loop playsInline src="/shipInThePortToshipInThePort.mp4" />
      <div className="dashboard-overlay" />

      <div className="dash-role-badge">Admin</div>

      <DashControls
        onSettingsClick={() => navigate('/admin/settings')}
        onLogoutClick={handleLogout}
      />

      <DashNav />

      {transitioning && (
        <PageTransition
          src="/shipInThePortToshipInTheSea.mp4"
          onEnd={handleTransitionEnd}
        />
      )}
    </div>
  )
}
