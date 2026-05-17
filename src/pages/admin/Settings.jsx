import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../../auth/AuthContext'
import { useTheme }    from '../../context/ThemeContext'
import NavBar          from '../../components/admin/NavBar'
import ProfileCard     from '../../components/admin/settings/ProfileCard'
import { getMe, updateMe } from '../../api/users'
import { changePassword }  from '../../api/auth'
import { getAnalytics }    from '../../api/admin'
import '../css/admin/Settings.css'

const LANGUAGES = ['English', 'Greek', 'Norwegian', 'Filipino', 'Romanian', 'Turkish', 'Ukrainian', 'Russian', 'Chinese']
const TABS = [
  { id: 'account',  label: 'Account'  },
  { id: 'profile',  label: 'Profile'  },
  { id: 'security', label: 'Security' },
]

function mapProfile(data) {
  return {
    firstName:   data.first_name          ?? '',
    lastName:    data.last_name           ?? '',
    username:    data.username            ?? '',
    email:       data.email               ?? '',
    phone:       data.profile?.phone       ?? '',
    nationality: data.profile?.nationality ?? '',
    language:    data.profile?.language    ?? 'English',
  }
}

function SaveRow({ status, onSave, saving }) {
  return (
    <div className="settings-save-row">
      {status === 'saved' && <span className="settings-feedback settings-feedback--ok">Saved</span>}
      {status === 'error' && <span className="settings-feedback settings-feedback--err">Something went wrong</span>}
      <button className="s-btn-save" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

export default function Settings() {
  const navigate            = useNavigate()
  const { logout }          = useAuth()
  const { theme, setTheme } = useTheme()

  const [profile, setProfile]   = useState(null)
  const [stats,   setStats]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [activeTab, setTab]     = useState('account')

  const [account, setAccount]   = useState({ firstName: '', lastName: '', username: '', email: '' })
  const [prefs,   setPrefs]     = useState({ phone: '', nationality: '', language: 'English' })
  const [pwd,     setPwd]       = useState({ current: '', next: '', confirm: '' })
  const [pwdError, setPwdError] = useState('')

  const [accountStatus, setAccountStatus] = useState(null)
  const [prefsStatus,   setPrefsStatus]   = useState(null)
  const [pwdStatus,     setPwdStatus]     = useState(null)
  const [pwdSaving,     setPwdSaving]     = useState(false)
  const timers = useRef({})

  const flash = (setter, value) => {
    setter(value)
    clearTimeout(timers.current[setter])
    if (value === 'saved') timers.current[setter] = setTimeout(() => setter(null), 3000)
  }

  useEffect(() => {
    Promise.all([getMe(), getAnalytics()])
      .then(([meRes, analyticsRes]) => {
        const p = mapProfile(meRes.data)
        setProfile(p)
        setAccount({ firstName: p.firstName, lastName: p.lastName, username: p.username, email: p.email })
        setPrefs({ phone: p.phone, nationality: p.nationality, language: p.language })
        setStats(analyticsRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAccountSave = async () => {
    setAccountStatus('saving')
    try {
      const { data } = await updateMe({ first_name: account.firstName, last_name: account.lastName, username: account.username, email: account.email })
      setProfile(mapProfile(data))
      flash(setAccountStatus, 'saved')
    } catch { flash(setAccountStatus, 'error') }
  }

  const handlePrefsSave = async () => {
    setPrefsStatus('saving')
    try {
      const { data } = await updateMe({ profile: { phone: prefs.phone, nationality: prefs.nationality, language: prefs.language } })
      setProfile(mapProfile(data))
      flash(setPrefsStatus, 'saved')
    } catch { flash(setPrefsStatus, 'error') }
  }

  const handlePasswordSave = async () => {
    setPwdError('')
    if (!pwd.current || !pwd.next)    { setPwdError('Please fill in all fields.'); return }
    if (pwd.next !== pwd.confirm)     { setPwdError('New passwords do not match.'); return }
    if (pwd.next.length < 8)          { setPwdError('Password must be at least 8 characters.'); return }
    setPwdSaving(true)
    flash(setPwdStatus, 'saving')
    try {
      await changePassword(pwd.current, pwd.next)
      flash(setPwdStatus, 'saved')
      setPwd({ current: '', next: '', confirm: '' })
    } catch (e) {
      setPwdError(e?.response?.data?.detail ?? 'Something went wrong.')
      flash(setPwdStatus, 'error')
    } finally { setPwdSaving(false) }
  }

  const handleSignOut = () => { logout(); navigate('/login') }

  const handleThemeChange = async (val) => {
    setTheme(val)
    try { await updateMe({ profile: { theme_preference: val } }) } catch (_) {}
  }

  if (loading) return (
    <div className="settings-page">
      <div className="settings-layout"><NavBar /></div>
    </div>
  )

  return (
    <div className="settings-page">
      <div className="settings-layout">
        <NavBar />

        <header className="settings-header">
          <div className="settings-breadcrumb">
            <button className="settings-crumb-link" onClick={() => navigate('/admin/dashboard')}>Dashboard</button>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <span className="settings-crumb-current">Settings</span>
          </div>
          <h1 className="settings-page-title">Settings</h1>
        </header>

        <div className="settings-body">
          <ProfileCard
            profile={{ ...profile, phone: prefs.phone }}
            stats={stats}
            onSignOut={handleSignOut}
          />

          <div className="settings-main">
            <div className="settings-tabs">
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`settings-tab ${activeTab === t.id ? 'settings-tab--active' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Account tab */}
            {activeTab === 'account' && (
              <div className="settings-panel">
                <div className="settings-panel-head">
                  <span className="settings-panel-title">Account</span>
                  <SaveRow status={accountStatus} onSave={handleAccountSave} saving={accountStatus === 'saving'} />
                </div>
                <div className="settings-grid">
                  <div className="s-form-row">
                    <label className="s-label">First Name</label>
                    <input className="s-input" value={account.firstName} placeholder="e.g. Alice"
                      onChange={e => setAccount(a => ({ ...a, firstName: e.target.value }))} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Last Name</label>
                    <input className="s-input" value={account.lastName} placeholder="e.g. Chen"
                      onChange={e => setAccount(a => ({ ...a, lastName: e.target.value }))} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Username</label>
                    <input className="s-input" value={account.username}
                      onChange={e => setAccount(a => ({ ...a, username: e.target.value }))} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Email</label>
                    <input className="s-input" type="email" value={account.email}
                      onChange={e => setAccount(a => ({ ...a, email: e.target.value }))} />
                  </div>
                </div>
                <div className="s-appearance-row">
                  <span className="s-label">Appearance</span>
                  <div className="s-theme-toggle">
                    <button
                      className={`s-theme-btn${theme === 'dark' ? ' s-theme-btn--active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                      </svg>
                      Dark
                    </button>
                    <button
                      className={`s-theme-btn${theme === 'light' ? ' s-theme-btn--active' : ''}`}
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
            )}

            {/* Profile tab */}
            {activeTab === 'profile' && (
              <div className="settings-panel">
                <div className="settings-panel-head">
                  <span className="settings-panel-title">Profile</span>
                  <SaveRow status={prefsStatus} onSave={handlePrefsSave} saving={prefsStatus === 'saving'} />
                </div>
                <div className="settings-grid">
                  <div className="s-form-row">
                    <label className="s-label">Phone</label>
                    <input className="s-input" value={prefs.phone} placeholder="+1 555 000 0000"
                      onChange={e => setPrefs(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Nationality</label>
                    <input className="s-input" value={prefs.nationality} placeholder="e.g. Greek"
                      onChange={e => setPrefs(p => ({ ...p, nationality: e.target.value }))} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Language</label>
                    <select className="s-select" value={prefs.language}
                      onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}>
                      {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Security tab */}
            {activeTab === 'security' && (
              <div className="settings-panel">
                <div className="settings-panel-head">
                  <span className="settings-panel-title">Security</span>
                  <SaveRow status={pwdStatus} onSave={handlePasswordSave} saving={pwdSaving} />
                </div>
                <div className="settings-pwd-grid">
                  <div className="s-form-row" style={{ gridColumn: '1 / -1' }}>
                    <label className="s-label">Current Password</label>
                    <input className="s-input" type="password" value={pwd.current} placeholder="Enter current password"
                      onChange={e => { setPwd(p => ({ ...p, current: e.target.value })); setPwdError('') }} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">New Password</label>
                    <input className="s-input" type="password" value={pwd.next} placeholder="At least 8 characters"
                      onChange={e => { setPwd(p => ({ ...p, next: e.target.value })); setPwdError('') }} />
                  </div>
                  <div className="s-form-row">
                    <label className="s-label">Confirm New Password</label>
                    <input className={`s-input ${pwdError ? 's-input--error' : ''}`} type="password" value={pwd.confirm} placeholder="Repeat new password"
                      onChange={e => { setPwd(p => ({ ...p, confirm: e.target.value })); setPwdError('') }} />
                  </div>
                </div>
                {pwdError && <p className="settings-pwd-error">{pwdError}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
