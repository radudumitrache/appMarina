import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/Profile.css'

// ── Static data ───────────────────────────────────────────────────────────────

const INITIAL_PROFILE = {
  firstName:   'Marina',
  lastName:    'Vasquez',
  email:       'marina.vasquez@seafarer.academy',
  employeeId:  'INS-2024-0031',
  nationality: 'Spanish',
  dateOfBirth: '1983-04-22',
  phone:       '+34 91 555 0144',
  department:  'Navigation & Deck Operations',
  subjects:    'Navigation, Cargo Handling, Emergency Procedures',
  startYear:   '2024',
  language:    'English',
  timezone:    'Europe/Madrid',
}

const QUALIFICATIONS = [
  { id: 1, name: 'Chief Officer Certificate of Competency',  issued: '2015-06-01', expires: '2030-06-01', status: 'valid'   },
  { id: 2, name: 'STCW Instructor Certification',            issued: '2024-01-15', expires: '2029-01-15', status: 'valid'   },
  { id: 3, name: 'Advanced Fire Fighting Instructor',        issued: '2024-03-10', expires: '2029-03-10', status: 'valid'   },
  { id: 4, name: 'VR Platform Trainer Certification',        issued: '2024-09-01', expires: '2027-09-01', status: 'valid'   },
  { id: 5, name: 'ECDIS Type Approval Certificate',          issued: '2020-11-01', expires: '2025-11-01', status: 'expiring' },
  { id: 6, name: 'Dynamic Positioning Operator',             issued: null,         expires: null,          status: 'pending' },
]

const TIMEZONES = [
  'Europe/Madrid', 'Europe/London', 'Europe/Paris',
  'America/New_York', 'America/Vancouver', 'America/Chicago',
  'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney', 'UTC',
]

const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Japanese', 'Mandarin', 'Arabic']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function qualExpiresSoon(iso) {
  if (!iso) return false
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 180
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [profile,   setProfile]   = useState(INITIAL_PROFILE)
  const [editing,   setEditing]   = useState(false)
  const [draft,     setDraft]     = useState(INITIAL_PROFILE)
  const [saved,     setSaved]     = useState(false)
  const [activeTab, setTab]       = useState('personal')

  // Password change
  const [pwCurrent,  setPwCurrent]  = useState('')
  const [pwNew,      setPwNew]      = useState('')
  const [pwConfirm,  setPwConfirm]  = useState('')
  const [pwErrors,   setPwErrors]   = useState({})
  const [pwSaved,    setPwSaved]    = useState(false)

  function handleEdit()   { setDraft(profile); setEditing(true); setSaved(false) }
  function handleCancel() { setEditing(false) }
  function handleSave()   {
    setProfile(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handlePwSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!pwCurrent)           errs.current = 'Enter your current password.'
    if (pwNew.length < 8)     errs.next    = 'Password must be at least 8 characters.'
    if (pwNew !== pwConfirm)  errs.confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setPwSaved(true)
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  const TABS = [
    { id: 'personal',      label: 'Personal Info'  },
    { id: 'teaching',      label: 'Teaching'       },
    { id: 'qualifications', label: 'Qualifications' },
    { id: 'security',      label: 'Security'       },
  ]

  return (
    <div className="tp-page">
      <NavBar />

      {/* Header */}
      <header className="tp-header">
        <div className="tp-breadcrumb">
          <button className="tp-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
            Dashboard
          </button>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="tp-crumb-current">Profile</span>
        </div>
        <h1 className="tp-page-title">Profile</h1>
      </header>

      {/* Body */}
      <div className="tp-body">

        {/* LEFT: Identity card */}
        <aside className="tp-aside">
          <div className="tp-card" style={{ animationDelay: '0s' }}>

            {/* Avatar */}
            <div className="tp-avatar">{initials}</div>

            {/* Identity */}
            <div className="tp-id-block">
              <span className="tp-full-name">{profile.firstName} {profile.lastName}</span>
              <span className="tp-employee-id">{profile.employeeId}</span>
              <span className="tp-role-badge">Instructor</span>
            </div>

            {/* Meta */}
            <div className="tp-meta-list">
              <div className="tp-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>{profile.department}</span>
              </div>
              <div className="tp-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
                </svg>
                <span>{profile.phone}</span>
              </div>
              <div className="tp-meta-row">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{profile.timezone}</span>
              </div>
            </div>

            <div className="tp-card-divider" />

            {/* Teaching summary */}
            <div className="tp-summary">
              <span className="tp-summary-label">Teaching Overview</span>
              <div className="tp-summary-stats">
                <div className="tp-summary-stat">
                  <span className="tp-summary-value">4</span>
                  <span className="tp-summary-key">Active classes</span>
                </div>
                <div className="tp-summary-stat">
                  <span className="tp-summary-value">47</span>
                  <span className="tp-summary-key">Total students</span>
                </div>
                <div className="tp-summary-stat">
                  <span className="tp-summary-value">3</span>
                  <span className="tp-summary-key">Courses published</span>
                </div>
              </div>
            </div>

            <div className="tp-card-divider" />

            <button
              className="tp-logout-btn"
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
        <div className="tp-main">

          {/* Tabs */}
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

          {/* ── Personal Info ── */}
          {activeTab === 'personal' && (
            <div className="tp-panel">
              <div className="tp-panel-head">
                <span className="tp-panel-title">Personal Information</span>
                <div className="tp-panel-head-right">
                  {saved && <span className="tp-save-confirm">Saved</span>}
                  {editing ? (
                    <>
                      <button className="tp-btn-secondary" onClick={handleCancel}>Cancel</button>
                      <button className="tp-btn-primary"   onClick={handleSave}>Save changes</button>
                    </>
                  ) : (
                    <button className="tp-btn-secondary" onClick={handleEdit}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  )}
                </div>
              </div>

              <div className="tp-form-grid">
                <div className="tp-form-field">
                  <label className="tp-form-label">First Name</label>
                  {editing
                    ? <input className="tp-form-input" value={draft.firstName} onChange={e => setDraft(d => ({ ...d, firstName: e.target.value }))} />
                    : <span className="tp-form-value">{profile.firstName}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Last Name</label>
                  {editing
                    ? <input className="tp-form-input" value={draft.lastName} onChange={e => setDraft(d => ({ ...d, lastName: e.target.value }))} />
                    : <span className="tp-form-value">{profile.lastName}</span>}
                </div>
                <div className="tp-form-field tp-form-field--wide">
                  <label className="tp-form-label">Email</label>
                  {editing
                    ? <input className="tp-form-input" type="email" value={draft.email} onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
                    : <span className="tp-form-value">{profile.email}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Phone</label>
                  {editing
                    ? <input className="tp-form-input" value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
                    : <span className="tp-form-value">{profile.phone}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Date of Birth</label>
                  {editing
                    ? <input className="tp-form-input" type="date" value={draft.dateOfBirth} onChange={e => setDraft(d => ({ ...d, dateOfBirth: e.target.value }))} />
                    : <span className="tp-form-value">{formatDate(profile.dateOfBirth)}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Nationality</label>
                  {editing
                    ? <input className="tp-form-input" value={draft.nationality} onChange={e => setDraft(d => ({ ...d, nationality: e.target.value }))} />
                    : <span className="tp-form-value">{profile.nationality}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Language</label>
                  {editing
                    ? (
                      <select className="tp-form-input tp-form-select" value={draft.language} onChange={e => setDraft(d => ({ ...d, language: e.target.value }))}>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    )
                    : <span className="tp-form-value">{profile.language}</span>}
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Timezone</label>
                  {editing
                    ? (
                      <select className="tp-form-input tp-form-select" value={draft.timezone} onChange={e => setDraft(d => ({ ...d, timezone: e.target.value }))}>
                        {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )
                    : <span className="tp-form-value">{profile.timezone}</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── Teaching ── */}
          {activeTab === 'teaching' && (
            <div className="tp-panel">
              <div className="tp-panel-head">
                <span className="tp-panel-title">Teaching Information</span>
              </div>

              <div className="tp-form-grid">
                <div className="tp-form-field tp-form-field--wide">
                  <label className="tp-form-label">Department</label>
                  <span className="tp-form-value">{profile.department}</span>
                </div>
                <div className="tp-form-field tp-form-field--wide">
                  <label className="tp-form-label">Subject Areas</label>
                  <span className="tp-form-value">{profile.subjects}</span>
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Employee ID</label>
                  <span className="tp-form-value tp-form-value--mono">{profile.employeeId}</span>
                </div>
                <div className="tp-form-field">
                  <label className="tp-form-label">Joined</label>
                  <span className="tp-form-value tp-form-value--mono">{profile.startYear}</span>
                </div>
              </div>

              <div className="tp-panel-divider" />

              {/* Stats snapshot */}
              <div className="tp-snapshot">
                <div className="tp-snapshot-item">
                  <span className="tp-snapshot-value">47</span>
                  <span className="tp-snapshot-label">Total students</span>
                </div>
                <div className="tp-snapshot-sep" />
                <div className="tp-snapshot-item">
                  <span className="tp-snapshot-value">78<span className="tp-snapshot-suffix">%</span></span>
                  <span className="tp-snapshot-label">Avg student score</span>
                </div>
                <div className="tp-snapshot-sep" />
                <div className="tp-snapshot-item">
                  <span className="tp-snapshot-value">3</span>
                  <span className="tp-snapshot-label">Courses published</span>
                </div>
                <div className="tp-snapshot-sep" />
                <div className="tp-snapshot-item">
                  <span className="tp-snapshot-value">4</span>
                  <span className="tp-snapshot-label">Active classes</span>
                </div>
              </div>

              <div className="tp-panel-divider" />

              <div className="tp-panel-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                To update your department or subject areas, contact your programme coordinator or submit a support ticket.
              </div>
            </div>
          )}

          {/* ── Qualifications ── */}
          {activeTab === 'qualifications' && (
            <div className="tp-panel">
              <div className="tp-panel-head">
                <span className="tp-panel-title">Qualifications</span>
              </div>

              <div className="tp-quals-list">
                {QUALIFICATIONS.map((q, i) => {
                  const soon = q.status === 'expiring' || qualExpiresSoon(q.expires)
                  const dotStatus = q.status === 'pending' ? 'pending' : soon ? 'soon' : 'valid'
                  return (
                    <div
                      key={q.id}
                      className="tp-qual-row"
                      style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    >
                      <div className={`tp-qual-dot tp-qual-dot--${dotStatus}`} />
                      <div className="tp-qual-body">
                        <span className="tp-qual-name">{q.name}</span>
                        <div className="tp-qual-dates">
                          {q.issued
                            ? <>
                                <span>Issued {formatDate(q.issued)}</span>
                                <span className="tp-qual-sep">·</span>
                                <span className={soon ? 'tp-qual-expiry--soon' : ''}>
                                  Expires {formatDate(q.expires)}
                                </span>
                              </>
                            : <span>Not yet issued</span>
                          }
                        </div>
                      </div>
                      <span className={`tp-qual-badge tp-qual-badge--${dotStatus}`}>
                        {q.status === 'pending' ? 'Pending' : soon ? 'Expiring soon' : 'Valid'}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="tp-panel-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Qualification records are managed by your institution. Contact your coordinator for renewals or corrections.
              </div>
            </div>
          )}

          {/* ── Security ── */}
          {activeTab === 'security' && (
            <div className="tp-panel">
              <div className="tp-panel-head">
                <span className="tp-panel-title">Security</span>
              </div>

              <div className="tp-security-block">
                <div className="tp-security-block-head">
                  <span className="tp-security-block-title">Change Password</span>
                </div>

                {pwSaved ? (
                  <div className="tp-pw-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Password updated successfully.
                  </div>
                ) : (
                  <form className="tp-pw-form" onSubmit={handlePwSubmit} noValidate>
                    <div className={`tp-form-field ${pwErrors.current ? 'tp-form-field--error' : ''}`}>
                      <label className="tp-form-label">Current password</label>
                      <input className="tp-form-input" type="password" value={pwCurrent} onChange={e => { setPwCurrent(e.target.value); setPwErrors(v => ({ ...v, current: '' })) }} />
                      {pwErrors.current && <span className="tp-form-error">{pwErrors.current}</span>}
                    </div>
                    <div className={`tp-form-field ${pwErrors.next ? 'tp-form-field--error' : ''}`}>
                      <label className="tp-form-label">New password</label>
                      <input className="tp-form-input" type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); setPwErrors(v => ({ ...v, next: '' })) }} />
                      {pwErrors.next && <span className="tp-form-error">{pwErrors.next}</span>}
                    </div>
                    <div className={`tp-form-field ${pwErrors.confirm ? 'tp-form-field--error' : ''}`}>
                      <label className="tp-form-label">Confirm new password</label>
                      <input className="tp-form-input" type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); setPwErrors(v => ({ ...v, confirm: '' })) }} />
                      {pwErrors.confirm && <span className="tp-form-error">{pwErrors.confirm}</span>}
                    </div>
                    <button type="submit" className="tp-btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Update password
                    </button>
                  </form>
                )}
              </div>

              <div className="tp-panel-divider" />

              <div className="tp-security-block">
                <div className="tp-security-block-head">
                  <span className="tp-security-block-title">Account</span>
                </div>
                <div className="tp-security-info-row">
                  <span className="tp-security-info-label">Last sign-in</span>
                  <span className="tp-security-info-value">Mar 29, 2026 · 08:42 UTC</span>
                </div>
                <div className="tp-security-info-row">
                  <span className="tp-security-info-label">Account created</span>
                  <span className="tp-security-info-value">Jan 10, 2024</span>
                </div>
                <div className="tp-security-info-row">
                  <span className="tp-security-info-label">Account status</span>
                  <span className="tp-security-status-active">Active</span>
                </div>
              </div>

              <div className="tp-panel-divider" />

              <div className="tp-security-danger">
                <span className="tp-security-danger-title">Danger Zone</span>
                <p className="tp-security-danger-body">
                  Deleting your account is permanent and cannot be undone. All classes, courses, and test records linked to this account will be permanently removed.
                </p>
                <button className="tp-btn-danger-ghost">
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
