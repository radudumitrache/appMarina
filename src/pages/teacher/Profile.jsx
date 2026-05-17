import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import NavBar              from '../../components/teacher/NavBar'
import ProfileCard         from '../../components/teacher/profile/ProfileCard'
import PersonalInfoPanel   from '../../components/teacher/profile/PersonalInfoPanel'
// import TeachingPanel       from '../../components/teacher/profile/TeachingPanel'
import SecurityPanel       from '../../components/teacher/profile/SecurityPanel'
import { getMe, updateMe } from '../../api/users'
import { changePassword }  from '../../api/auth'
import { getClasses }      from '../../api/classes'
import { getLessons }      from '../../api/lessons'
import Sk from '../../components/shared/Skeleton'
import '../css/teacher/Profile.css'

const TABS = [
  { id: 'personal',  label: 'Personal Info' },
  // { id: 'teaching',  label: 'Teaching'      },
  { id: 'security',  label: 'Security'      },
]

function mapProfile(data) {
  return {
    firstName:     data.first_name       ?? '',
    lastName:      data.last_name        ?? '',
    email:         data.email            ?? '',
    username:      data.username         ?? '',
    employeeId:    data.profile?.student_id    ?? '',
    nationality:   data.profile?.nationality   ?? '',
    dateOfBirth:   data.profile?.date_of_birth ?? '',
    phone:         data.profile?.phone         ?? '',
    department:    data.profile?.institution   ?? '',
    organisation:  data.profile?.organisation  ?? '',
    subjects:      data.profile?.program       ?? '',
    startYear:     data.profile?.start_year    ?? '',
    language:      data.profile?.language      ?? 'English',
    accountStatus: data.profile?.account_status ?? 'active',
    createdAt:     data.profile?.created_at    ?? '',
    lastActive:    data.profile?.last_active   ?? '',
  }
}

export default function Profile() {
  const navigate            = useNavigate()
  const { logout }          = useAuth()
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState(null)
  const [stats,   setStats]   = useState({ activeClasses: 0, totalStudents: 0, publishedLessons: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setTab]   = useState('personal')

  useEffect(() => {
    Promise.all([getMe(), getClasses(), getLessons()])
      .then(([meRes, clsRes, lesRes]) => {
        setProfile(mapProfile(meRes.data))
        const classes = clsRes.data
        const lessons = lesRes.data
        const me = meRes.data
        const fullName = `${me.first_name} ${me.last_name}`.trim()
        setStats({
          activeClasses:    classes.filter(c => c.status === 'active').length,
          totalStudents:    classes.reduce((sum, c) => sum + (c.student_count || 0), 0),
          publishedLessons: lessons.filter(l => l.visibility === 'public' && l.author_name === fullName).length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleThemeChange = async (val) => {
    setTheme(val)
    try { await updateMe({ profile: { theme_preference: val } }) } catch (_) {}
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
        organisation:  draft.organisation,
        language:      draft.language,
      },
    })
    setProfile(mapProfile(data))
  }

  if (loading) {
    return (
      <div className="tp-page">
        <NavBar />
        <header className="tp-header">
          <Sk w={200} h={13} r={4} mb={10} />
          <Sk w={100} h={26} r={6} />
        </header>
        <div className="tp-body">
          <div style={{ width: 260, flexShrink: 0 }}>
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
          stats={stats}
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

          {activeTab === 'personal' && <PersonalInfoPanel profile={profile} onSave={handleSave}       />}
          {/* {activeTab === 'teaching' && <TeachingPanel     profile={profile} stats={stats}             />} */}
          {activeTab === 'security' && <SecurityPanel     onChangePassword={changePassword}           />}

          <div className="tp-appearance-panel">
            <span className="tp-appearance-label">Appearance</span>
            <div className="tp-theme-toggle">
              <button
                className={`tp-theme-btn${theme === 'dark' ? ' tp-theme-btn--active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                Dark
              </button>
              <button
                className={`tp-theme-btn${theme === 'light' ? ' tp-theme-btn--active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                Light
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
