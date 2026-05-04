import { useState } from 'react'
import '../../css/teacher/profile/SecurityPanel.css'

export default function SecurityPanel() {
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew,     setPwNew]     = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwErrors,  setPwErrors]  = useState({})
  const [pwSaved,   setPwSaved]   = useState(false)

  function handlePwSubmit(e) {
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

  return (
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
        <button className="tp-btn-danger-ghost">Delete account</button>
      </div>
    </div>
  )
}
