import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/student/NavBar'
import ProfileCard from '../../components/student/profile/ProfileCard'
import PersonalInfoTab from '../../components/student/profile/PersonalInfoTab'
import AcademicTab from '../../components/student/profile/AcademicTab'
import CertificationsTab from '../../components/student/profile/CertificationsTab'
import AchievementsTab from '../../components/student/profile/AchievementsTab'
import SecurityTab from '../../components/student/profile/SecurityTab'
import { getMe, updateMe } from '../../api/users'
import { changePassword } from '../../api/auth'
import { getProgress, getAchievements, getCertifications } from '../../api/progress'
import Sk from '../../components/shared/Skeleton'
import '../css/student/Profile.css'

const TABS = [
  { id: 'personal',      label: 'Personal Info'  },
  { id: 'academic',      label: 'Academic'       },
  { id: 'achievements',  label: 'Achievements'   },
  // { id: 'certs',      label: 'Certifications' },
  { id: 'security',      label: 'Security'       },
]

function mapProfile(data) {
  return {
    firstName:     data.first_name       ?? '',
    lastName:      data.last_name        ?? '',
    email:         data.email            ?? '',
    username:      data.username         ?? '',
    studentId:     data.profile?.student_id    ?? '',
    nationality:   data.profile?.nationality   ?? '',
    dateOfBirth:   data.profile?.date_of_birth ?? '',
    phone:         data.profile?.phone         ?? '',
    institution:   data.profile?.institution   ?? '',
    program:       data.profile?.program       ?? '',
    startYear:     data.profile?.start_year    ?? '',
    language:      data.profile?.language      ?? 'English',
    timezone:      data.profile?.timezone      ?? 'UTC',
    accountStatus: data.profile?.account_status ?? 'active',
    createdAt:     data.profile?.created_at    ?? '',
    lastActive:    data.profile?.last_active   ?? '',
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile,       setProfile]       = useState(null)
  const [stats,         setStats]         = useState(null)
  const [achievements,  setAchievements]  = useState([])
  const [certifications,setCertifications]= useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setTab]           = useState('personal')

  useEffect(() => {
    Promise.all([getMe(), getProgress(), getAchievements(), getCertifications()])
      .then(([meRes, progressRes, achRes, certRes]) => {
        setProfile(mapProfile(meRes.data))
        setStats(progressRes.data)
        setAchievements((achRes.data ?? []).map(a => ({
          id:     a.id,
          label:  a.label,
          icon:   a.icon,
          earned: a.earned,
          date:   a.earned_at ?? null,
        })))
        setCertifications((certRes.data ?? []).map(c => ({
          id:      c.id,
          name:    c.name,
          issued:  c.issued_date  ?? null,
          expires: c.expiry_date  ?? null,
          status:  c.status,
        })))
      })
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/', { state: { logout: true } })
  }

  const handleSave = async (draft) => {
    const { data } = await updateMe({
      first_name: draft.firstName,
      last_name:  draft.lastName,
      email:      draft.email,
      profile: {
        nationality:   draft.nationality,
        date_of_birth: draft.dateOfBirth,
        phone:         draft.phone,
        language:      draft.language,
        timezone:      draft.timezone,
      },
    })
    setProfile(mapProfile(data))
  }

  if (loading) {
    return (
      <div className="profile-page">
        <NavBar />
        <header className="profile-header">
          <Sk w={200} h={13} r={4} mb={10} />
          <Sk w={120} h={26} r={6} />
        </header>
        <div className="profile-body">
          <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Sk h={260} r={12} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {TABS.map(t => <Sk key={t.id} w={110} h={34} r={6} />)}
            </div>
            <Sk h={320} r={10} />
          </div>
        </div>
      </div>
    )
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

          {activeTab === 'personal'     && <PersonalInfoTab   profile={profile}                    onSave={handleSave}    />}
          {activeTab === 'academic'     && <AcademicTab       profile={profile}  stats={stats}                             />}
          {activeTab === 'achievements' && <AchievementsTab   achievements={achievements}                                  />}
          {/* {activeTab === 'certs'     && <CertificationsTab  certifications={certifications}                            />} */}
          {activeTab === 'security'     && <SecurityTab       onChangePassword={changePassword}                            />}
        </div>
      </div>
    </div>
  )
}
