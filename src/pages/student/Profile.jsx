import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/student/NavBar'
import '../css/student/Profile.css'

// ── Static data ───────────────────────────────────────────────────────────────

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
  { id: 1, name: 'STCW Basic Safety Training',        issued: '2025-09-01', expires: '2030-09-01', status: 'valid'   },
  { id: 2, name: 'Proficiency in Survival Craft',     issued: '2025-09-01', expires: '2030-09-01', status: 'valid'   },
  { id: 3, name: 'Advanced Fire Fighting',            issued: '2025-10-15', expires: '2030-10-15', status: 'valid'   },
  { id: 4, name: 'Medical First Aid',                 issued: '2025-10-15', expires: '2028-10-15', status: 'valid'   },
  { id: 5, name: 'Officer of the Watch (Deck)',       issued: null,         expires: null,          status: 'pending' },
]

const ACHIEVEMENTS = [
  { id: 1, label: 'First Lesson Complete',    icon: 'book',  earned: true,  date: '2026-02-10' },
  { id: 2, label: 'Perfect Score',            icon: 'star',  earned: true,  date: '2026-03-20' },
  { id: 3, label: '3-Day Streak',             icon: 'flame', earned: true,  date: '2026-03-27' },
  { id: 4, label: 'Module Master',            icon: 'award', earned: true,  date: '2026-03-18' },
  { id: 5, label: '10 Lessons Complete',      icon: 'book',  earned: false, date: null         },
  { id: 6, label: 'Top of the Class',         icon: 'crown', earned: false, date: null         },
]

const TIMEZONES = [
  'America/Vancouver', 'America/New_York', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'UTC',
]

const LANGUAGES = ['English', 'French', 'Spanish', 'Portuguese', 'Japanese', 'Mandarin', 'Arabic']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function certExpiresSoon(iso) {
  if (!iso) return false
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 180
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile, setProfile]   = useState(INITIAL_PROFILE)
  const [editing, setEditing]   = useState(false)
  const [draft,   setDraft]     = useState(INITIAL_PROFILE)
  const [saved,   setSaved]     = useState(false)
  const [activeTab, setTab]     = useState('personal')

  // Password change
  const [pwCurrent,  setPwCurrent]  = useState('')
  const [pwNew,      setPwNew]      = useState('')
  const [pwConfirm,  setPwConfirm]  = useState('')
  const [pwErrors,   setPwErrors]   = useState({})
  const [pwSaved,    setPwSaved]    = useState(false)

  function handleEdit() { setDraft(profile); setEditing(true); setSaved(false) }
  function handleCancel() { setEditing(false) }
  function handleSave() {
    setProfile(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handlePwSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!pwCurrent)            errs.current = 'Enter your current password.'
    if (pwNew.length < 8)      errs.next    = 'Password must be at least 8 characters.'
    if (pwNew !== pwConfirm)   errs.confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setPwSaved(true)
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  const TABS = [
    { id: 'personal',  label: 'Personal Info'   },
    { id: 'academic',  label: 'Academic'        },
    { id: 'certs',     label: 'Certifications'  },
    { id: 'security',  label: 'Security'        },
  ]

  return (
    <div className="profile-page">
      <NavBar />

      {/* Header */}
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

      {/* Body */}
      <div className="profile-body">

        {/* LEFT: Identity card */}
        <aside className="profile-aside">
          <div className="profile-card" style={{ animationDelay: '0s' }}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-id-block">
              <span className="profile-full-name">{profile.firstName} {profile.lastName}</span>
              <span className="profile-student-id">{profile.studentId}</span>
              <span className="profile-role-badge">Student</span>
            </div>
            <div className="profile-meta-list">
              <div className="profile-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>{profile.institution}</span>
              </div>
              <div className="profile-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
                </svg>
                <span>{profile.phone}</span>
              </div>
              <div className="profile-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{profile.timezone}</span>
              </div>
            </div>

            <div className="profile-card-divider" />

            {/* Achievements */}
            <div className="achievements-block">
              <span className="achievements-label">Achievements</span>
              <div className="achievements-grid">
                {ACHIEVEMENTS.map(a => (
                  <div
                    key={a.id}
                    className={`achievement-chip ${a.earned ? 'achievement-chip--earned' : 'achievement-chip--locked'}`}
                    title={a.earned ? `${a.label} · ${formatDate(a.date)}` : `${a.label} · Not yet earned`}
                  >
                    {a.icon === 'book'  && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>}
                    {a.icon === 'star'  && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                    {a.icon === 'flame' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 0 1-7 7 7 7 0 0 1-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
                    {a.icon === 'award' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>}
                    {a.icon === 'crown' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>}
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card-divider" />

            <button
              className="logout-btn"
              onClick={() => { logout(); navigate('/', { state: { logout: true } }) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* RIGHT: Tabbed content */}
        <div className="profile-main">

          {/* Tabs */}
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

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <div className="profile-panel">
              <div className="panel-head">
                <span className="panel-title">Personal Information</span>
                <div className="panel-head-right">
                  {saved && <span className="save-confirm">Saved</span>}
                  {editing ? (
                    <>
                      <button className="btn-secondary-sm" onClick={handleCancel}>Cancel</button>
                      <button className="btn-primary-sm"   onClick={handleSave}>Save changes</button>
                    </>
                  ) : (
                    <button className="btn-secondary-sm" onClick={handleEdit}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-field">
                  <label className="form-label">First Name</label>
                  {editing
                    ? <input className="form-input" value={draft.firstName} onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))} />
                    : <span className="form-value">{profile.firstName}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Last Name</label>
                  {editing
                    ? <input className="form-input" value={draft.lastName} onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))} />
                    : <span className="form-value">{profile.lastName}</span>}
                </div>
                <div className="form-field form-field--wide">
                  <label className="form-label">Email</label>
                  {editing
                    ? <input className="form-input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
                    : <span className="form-value">{profile.email}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  {editing
                    ? <input className="form-input" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
                    : <span className="form-value">{profile.phone}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Date of Birth</label>
                  {editing
                    ? <input className="form-input" type="date" value={draft.dateOfBirth} onChange={e => setDraft(d => ({ ...d, dateOfBirth: e.target.value }))} />
                    : <span className="form-value">{formatDate(profile.dateOfBirth)}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Nationality</label>
                  {editing
                    ? <input className="form-input" value={draft.nationality} onChange={e => setDraft(d => ({ ...d, nationality: e.target.value }))} />
                    : <span className="form-value">{profile.nationality}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Language</label>
                  {editing
                    ? (
                      <select className="form-input form-select" value={draft.language} onChange={e => setDraft(d => ({ ...d, language: e.target.value }))}>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    )
                    : <span className="form-value">{profile.language}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Timezone</label>
                  {editing
                    ? (
                      <select className="form-input form-select" value={draft.timezone} onChange={e => setDraft(d => ({ ...d, timezone: e.target.value }))}>
                        {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )
                    : <span className="form-value">{profile.timezone}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Academic ── */}
          {activeTab === 'academic' && (
            <div className="profile-panel">
              <div className="panel-head">
                <span className="panel-title">Academic Information</span>
              </div>

              <div className="form-grid">
                <div className="form-field form-field--wide">
                  <label className="form-label">Institution</label>
                  <span className="form-value">{profile.institution}</span>
                </div>
                <div className="form-field form-field--wide">
                  <label className="form-label">Programme</label>
                  <span className="form-value">{profile.program}</span>
                </div>
                <div className="form-field">
                  <label className="form-label">Student ID</label>
                  <span className="form-value form-value--mono">{profile.studentId}</span>
                </div>
                <div className="form-field">
                  <label className="form-label">Start Year</label>
                  <span className="form-value form-value--mono">{profile.startYear}</span>
                </div>
              </div>

              <div className="panel-divider" />

              {/* Progress snapshot */}
              <div className="academic-snapshot">
                <div className="snapshot-item">
                  <span className="snapshot-value">5</span>
                  <span className="snapshot-label">Lessons complete</span>
                </div>
                <div className="snapshot-sep" />
                <div className="snapshot-item">
                  <span className="snapshot-value">72<span className="snapshot-suffix">%</span></span>
                  <span className="snapshot-label">Avg test grade</span>
                </div>
                <div className="snapshot-sep" />
                <div className="snapshot-item">
                  <span className="snapshot-value">5</span>
                  <span className="snapshot-label">Tests taken</span>
                </div>
                <div className="snapshot-sep" />
                <div className="snapshot-item">
                  <span className="snapshot-value">7<span className="snapshot-suffix">th</span></span>
                  <span className="snapshot-label">Class rank</span>
                </div>
              </div>

              <div className="panel-divider" />

              <div className="panel-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                To update institution or programme, contact your programme coordinator or submit a support ticket.
              </div>
            </div>
          )}

          {/* ── Certifications ── */}
          {activeTab === 'certs' && (
            <div className="profile-panel">
              <div className="panel-head">
                <span className="panel-title">Certifications</span>
              </div>

              <div className="certs-list">
                {CERTIFICATIONS.map((cert, i) => {
                  const soon = certExpiresSoon(cert.expires)
                  return (
                    <div
                      key={cert.id}
                      className="cert-row"
                      style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    >
                      <div className={`cert-status-dot cert-status-dot--${cert.status === 'pending' ? 'pending' : soon ? 'soon' : 'valid'}`} />
                      <div className="cert-body">
                        <span className="cert-name">{cert.name}</span>
                        <div className="cert-dates">
                          {cert.issued
                            ? <>
                                <span>Issued {formatDate(cert.issued)}</span>
                                <span className="cert-sep">·</span>
                                <span className={soon ? 'cert-expiry--soon' : ''}>
                                  Expires {formatDate(cert.expires)}
                                </span>
                              </>
                            : <span>Not yet issued</span>
                          }
                        </div>
                      </div>
                      <span className={`cert-badge cert-badge--${cert.status === 'pending' ? 'pending' : soon ? 'soon' : 'valid'}`}>
                        {cert.status === 'pending' ? 'Pending' : soon ? 'Expiring soon' : 'Valid'}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="panel-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Certification records are managed by your institution. Contact your coordinator for renewals or corrections.
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="profile-panel">
              <div className="panel-head">
                <span className="panel-title">Security</span>
              </div>

              <div className="security-block">
                <div className="security-block-head">
                  <span className="security-block-title">Change Password</span>
                </div>

                {pwSaved ? (
                  <div className="pw-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Password updated successfully.
                  </div>
                ) : (
                  <form className="pw-form" onSubmit={handlePwSubmit} noValidate>
                    <div className={`form-field ${pwErrors.current ? 'form-field--error' : ''}`}>
                      <label className="form-label">Current password</label>
                      <input className="form-input" type="password" value={pwCurrent} onChange={e => { setPwCurrent(e.target.value); setPwErrors(v => ({ ...v, current: '' })) }} />
                      {pwErrors.current && <span className="form-error">{pwErrors.current}</span>}
                    </div>
                    <div className={`form-field ${pwErrors.next ? 'form-field--error' : ''}`}>
                      <label className="form-label">New password</label>
                      <input className="form-input" type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); setPwErrors(v => ({ ...v, next: '' })) }} />
                      {pwErrors.next && <span className="form-error">{pwErrors.next}</span>}
                    </div>
                    <div className={`form-field ${pwErrors.confirm ? 'form-field--error' : ''}`}>
                      <label className="form-label">Confirm new password</label>
                      <input className="form-input" type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwErrors(v => ({ ...v, confirm: '' })) }} />
                      {pwErrors.confirm && <span className="form-error">{pwErrors.confirm}</span>}
                    </div>
                    <button type="submit" className="btn-primary-sm" style={{ alignSelf: 'flex-start' }}>
                      Update password
                    </button>
                  </form>
                )}
              </div>

              <div className="panel-divider" />

              <div className="security-block">
                <div className="security-block-head">
                  <span className="security-block-title">Account</span>
                </div>
                <div className="security-info-row">
                  <span className="security-info-label">Last sign-in</span>
                  <span className="security-info-value">Mar 29, 2026 · 09:14 UTC</span>
                </div>
                <div className="security-info-row">
                  <span className="security-info-label">Account created</span>
                  <span className="security-info-value">Feb 3, 2025</span>
                </div>
                <div className="security-info-row">
                  <span className="security-info-label">Account status</span>
                  <span className="security-status-active">Active</span>
                </div>
              </div>

              <div className="panel-divider" />

              <div className="security-danger">
                <span className="security-danger-title">Danger Zone</span>
                <p className="security-danger-body">
                  Deleting your account is permanent and cannot be undone. All progress, test results, and certifications linked to this account will be removed.
                </p>
                <button className="btn-danger-ghost">
                  Delete account
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
