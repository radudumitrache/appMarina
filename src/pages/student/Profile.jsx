import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/student/NavBar'
import ProfileCard from '../../components/student/profile/ProfileCard'
import PersonalInfoTab from '../../components/student/profile/PersonalInfoTab'
import AcademicTab from '../../components/student/profile/AcademicTab'
import CertificationsTab from '../../components/student/profile/CertificationsTab'
import SecurityTab from '../../components/student/profile/SecurityTab'
import '../css/student/Profile.css'

const INITIAL_PROFILE = {
  firstName:   'Alex',
  lastName:    'Mercer',
  email:       'alex.mercer@seafarer.academy',
  studentId:   'SF-2026-0142',
  nationality: 'Canadian',
  dateOfBirth: '2001-08-17',
  phone:       '+1 604 555 0198',
  institution: 'Pacific Maritime Institute',
  program:     'Officer Cadet – Deck',
  startYear:   '2025',
  language:    'English',
  timezone:    'America/Vancouver',
}

const CERTIFICATIONS = [
  { id: 1, name: 'STCW Basic Safety Training',    issued: '2025-09-01', expires: '2030-09-01', status: 'valid'   },
  { id: 2, name: 'Proficiency in Survival Craft', issued: '2025-09-01', expires: '2030-09-01', status: 'valid'   },
  { id: 3, name: 'Advanced Fire Fighting',         issued: '2025-10-15', expires: '2030-10-15', status: 'valid'   },
  { id: 4, name: 'Medical First Aid',              issued: '2025-10-15', expires: '2028-10-15', status: 'valid'   },
  { id: 5, name: 'Officer of the Watch (Deck)',    issued: null,         expires: null,          status: 'pending' },
]

const ACHIEVEMENTS = [
  { id: 1, label: 'First Lesson Complete', icon: 'book',  earned: true,  date: '2026-02-10' },
  { id: 2, label: 'Perfect Score',         icon: 'star',  earned: true,  date: '2026-03-20' },
  { id: 3, label: '3-Day Streak',          icon: 'flame', earned: true,  date: '2026-03-27' },
  { id: 4, label: 'Module Master',         icon: 'award', earned: true,  date: '2026-03-18' },
  { id: 5, label: '10 Lessons Complete',   icon: 'book',  earned: false, date: null         },
  { id: 6, label: 'Top of the Class',      icon: 'crown', earned: false, date: null         },
]

const TABS = [
  { id: 'personal', label: 'Personal Info'  },
  { id: 'academic', label: 'Academic'       },
  { id: 'certs',    label: 'Certifications' },
  { id: 'security', label: 'Security'       },
]

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile,   setProfile]  = useState(INITIAL_PROFILE)
  const [activeTab, setTab]      = useState('personal')

  function handleLogout() {
    logout()
    navigate('/', { state: { logout: true } })
  }

  return (
    <div className="profile-page">
      <NavBar />

      <header className="profile-header">
        <div className="profile-breadcrumb">
          <button className="breadcrumb-link" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="breadcrumb-current">Settings</span>
        </div>
        <h1 className="profile-page-title">Settings</h1>
      </header>

      <div className="profile-body">
        <ProfileCard
          profile={profile}
          achievements={ACHIEVEMENTS}
          onLogout={handleLogout}
        />

        <div className="profile-main">
          <div className="profile-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`profile-tab ${activeTab === tab.id ? 'profile-tab--active' : ''}`}
                onClick={() => setTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'personal'  && <PersonalInfoTab    profile={profile}              onSave={setProfile}    />}
          {activeTab === 'academic'  && <AcademicTab        profile={profile}                                     />}
          {activeTab === 'certs'     && <CertificationsTab  certifications={CERTIFICATIONS}                       />}
          {activeTab === 'security'  && <SecurityTab                                                              />}
        </div>
      </div>
    </div>
  )
}
