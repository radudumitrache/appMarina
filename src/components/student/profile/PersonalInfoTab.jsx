import '../../css/student/profile/PersonalInfoTab.css'
import { useState } from 'react'

const TIMEZONES = [
  'America/Vancouver', 'America/New_York', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore',
  'Australia/Sydney', 'UTC',
]

const LANGUAGES = ['English', 'French', 'Spanish', 'Portuguese', 'Japanese', 'Mandarin', 'Arabic']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PersonalInfoTab({ profile, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(profile)
  const [saved,   setSaved]   = useState(false)

  function handleEdit()   { setDraft(profile); setEditing(true); setSaved(false) }
  function handleCancel() { setEditing(false) }
  function handleSave()   {
    onSave(draft)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const set = (key) => (e) => setDraft(d => ({ ...d, [key]: e.target.value }))

  return (
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
          {editing ? <input className="form-input" value={draft.firstName} onChange={set('firstName')} /> : <span className="form-value">{profile.firstName}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Last Name</label>
          {editing ? <input className="form-input" value={draft.lastName} onChange={set('lastName')} /> : <span className="form-value">{profile.lastName}</span>}
        </div>
        <div className="form-field form-field--wide">
          <label className="form-label">Email</label>
          {editing ? <input className="form-input" type="email" value={draft.email} onChange={set('email')} /> : <span className="form-value">{profile.email}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Phone</label>
          {editing ? <input className="form-input" value={draft.phone} onChange={set('phone')} /> : <span className="form-value">{profile.phone}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Date of Birth</label>
          {editing ? <input className="form-input" type="date" value={draft.dateOfBirth} onChange={set('dateOfBirth')} /> : <span className="form-value">{formatDate(profile.dateOfBirth)}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Nationality</label>
          {editing ? <input className="form-input" value={draft.nationality} onChange={set('nationality')} /> : <span className="form-value">{profile.nationality}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Language</label>
          {editing ? (
            <select className="form-input form-select" value={draft.language} onChange={set('language')}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          ) : <span className="form-value">{profile.language}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Timezone</label>
          {editing ? (
            <select className="form-input form-select" value={draft.timezone} onChange={set('timezone')}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : <span className="form-value">{profile.timezone}</span>}
        </div>
      </div>
    </div>
  )
}
