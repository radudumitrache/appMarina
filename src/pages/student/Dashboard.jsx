import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import DashRoleBadge from '../../components/student/dashboard/DashRoleBadge'
import DashControls from '../../components/student/dashboard/DashControls'
import DashNavGrid from '../../components/student/dashboard/DashNavGrid'
import LogoutTransition from '../../components/student/dashboard/LogoutTransition'
import '../css/student/Dashboard.css'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [uiLeaving,    setUiLeaving]    = useState(false)
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
    <div className="dashboard-page">
      <video className="dashboard-bg" autoPlay muted loop playsInline src="/shipInThePortToshipInThePort.mp4" />
      <div className="dashboard-overlay" />

      <DashRoleBadge uiLeaving={uiLeaving} />

      <DashControls
        uiLeaving={uiLeaving}
        onSettings={() => navigate('/student/profile')}
        onLogout={handleLogout}
      />

      <DashNavGrid uiLeaving={uiLeaving} username={user?.username} />

      {transitioning && <LogoutTransition onEnd={handleTransitionEnd} />}
    </div>
  )
}
