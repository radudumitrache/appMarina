import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar                from '../../components/teacher/NavBar'
import ProfileCard           from '../../components/teacher/profile/ProfileCard'
import PersonalInfoPanel     from '../../components/teacher/profile/PersonalInfoPanel'
import TeachingPanel         from '../../components/teacher/profile/TeachingPanel'
import QualificationsPanel   from '../../components/teacher/profile/QualificationsPanel'
import SecurityPanel         from '../../components/teacher/profile/SecurityPanel'
import { INITIAL_PROFILE }   from './profileMock'
import '../css/teacher/Profile.css'

const TABS = [
  { id: 'personal',       label: 'Personal Info'  },
  { id: 'teaching',       label: 'Teaching'       },
  { id: 'qualifications', label: 'Qualifications' },
  { id: 'security',       label: 'Security'       },
]

export default function Profile() {
  const navigate    = useNavigate()
  const { logout }  = useAuth()
  const [profile,   setProfile]  = useState(INITIAL_PROFILE)
  const [activeTab, setTab]      = useState('personal')

  return (
    <div className="tp-page">
      <NavBar />

      <header className="tp-header">
        <div className="tp-breadcrumb">
          <button className="tp-crumb-link" onClick={() => navigate('/teacher/dashboard')}>Dashboard</button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="tp-crumb-current">Profile</span>
        </div>
        <h1 className="tp-page-title">Profile</h1>
      </header>

      <div className="tp-body">
        <ProfileCard
          profile={profile}
          onSignOut={() => { logout(); navigate('/', { state: { logout: true } }) }}
        />

        <div className="tp-main">
          <div className="tp-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`tp-tab ${activeTab === tab.id ? 'tp-tab--active' : ''}`}
                onClick={() => setTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'personal'       && <PersonalInfoPanel   profile={profile} onSave={setProfile} />}
          {activeTab === 'teaching'       && <TeachingPanel        profile={profile} />}
          {activeTab === 'qualifications' && <QualificationsPanel />}
          {activeTab === 'security'       && <SecurityPanel />}
        </div>
      </div>
    </div>
  )
}
