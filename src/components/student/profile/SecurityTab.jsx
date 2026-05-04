import '../../css/student/profile/SecurityTab.css'
import { useState } from 'react'

export default function SecurityTab() {
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew,     setPwNew]     = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwErrors,  setPwErrors]  = useState({})
  const [pwSaved,   setPwSaved]   = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (!pwCurrent)          errs.current = 'Enter your current password.'
    if (pwNew.length < 8)    errs.next    = 'Password must be at least 8 characters.'
    if (pwNew !== pwConfirm) errs.confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }
    setPwErrors({})
    setPwSaved(true)
    setPwCurrent(''); setPwNew(''); setPwConfirm('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  const clearError = (key) => () => setPwErrors(v => ({ ...v, [key]: '' }))

  return (
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
          <form className="pw-form" onSubmit={handleSubmit} noValidate>
            <div className={`form-field ${pwErrors.current ? 'form-field--error' : ''}`}>
              <label className="form-label">Current password</label>
              <input className="form-input" type="password" value={pwCurrent} onChange={e => { setPwCurrent(e.target.value); clearError('current')() }} />
              {pwErrors.current && <span className="form-error">{pwErrors.current}</span>}
            </div>
            <div className={`form-field ${pwErrors.next ? 'form-field--error' : ''}`}>
              <label className="form-label">New password</label>
              <input className="form-input" type="password" value={pwNew} onChange={e => { setPwNew(e.target.value); clearError('next')() }} />
              {pwErrors.next && <span className="form-error">{pwErrors.next}</span>}
            </div>
            <div className={`form-field ${pwErrors.confirm ? 'form-field--error' : ''}`}>
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password" value={pwConfirm} onChange={e => { setPwConfirm(e.target.value); clearError('confirm')() }} />
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
        <button className="btn-danger-ghost">Delete account</button>
      </div>
    </div>
  )
}
