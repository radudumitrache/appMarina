import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import DashControls    from '../../components/trainer/dashboard/DashControls'
import DashNav         from '../../components/trainer/dashboard/DashNav'
import PageTransition  from '../../components/trainer/dashboard/PageTransition'
import '../css/trainer/Dashboard.css'

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
    navigate('/login')
  }

  return (
    <div className={`dashboard-page${uiLeaving ? ' dashboard-page--leaving' : ''}`}>
      <video className="dashboard-bg" autoPlay muted loop playsInline src="/shipInThePortToshipInThePort.mp4" />
      <div className="dashboard-overlay" />

      <div className="dash-role-badge">Instructor</div>

      <DashControls onLogout={handleLogout} onProfile={() => navigate('/trainer/profile')} />
      <DashNav />

      {transitioning && <PageTransition onEnd={handleTransitionEnd} />}
    </div>
  )
}
