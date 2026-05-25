import { useState } from 'react'
import '../../css/teacher/profile/PersonalInfoPanel.css'


const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Japanese', 'Mandarin', 'Arabic']

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PersonalInfoPanel({ profile, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(profile)
  const [saved,   setSaved]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  function handleEdit()   { setDraft(profile); setEditing(true); setSaved(false); setError('') }
  function handleCancel() { setEditing(false); setError('') }
  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await onSave(draft)
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function field(label, key, type = 'text', wide = false) {
    return (
      <div className={`tp-form-field${wide ? ' tp-form-field--wide' : ''}`}>
        <label className="tp-form-label">{label}</label>
        {editing
          ? <input className="tp-form-input" type={type} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
          : <span className="tp-form-value">{type === 'date' ? formatDate(profile[key]) : profile[key]}</span>}
      </div>
    )
  }

  return (
    <div className="tp-panel">
      <div className="tp-panel-head">
        <span className="tp-panel-title">Personal Information</span>
        <div className="tp-panel-head-right">
          {saved && <span className="tp-save-confirm">Saved</span>}
          {editing ? (
            <>
              {error && <span className="tp-form-error">{error}</span>}
              <button className="tp-btn-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              <button className="tp-btn-primary"   onClick={handleSave}  disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
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
        {field('First Name',    'firstName')}
        {field('Last Name',     'lastName')}
        {field('Email',         'email',       'email', true)}
        {field('Phone',         'phone')}

        <div className="tp-form-field">
          <label className="tp-form-label">Date of Birth</label>
          {editing
            ? <input className="tp-form-input tp-form-input--date" type="date" value={draft.dateOfBirth ?? ''} onChange={e => setDraft(d => ({ ...d, dateOfBirth: e.target.value }))} />
            : <span className="tp-form-value">{formatDate(profile.dateOfBirth)}</span>}
        </div>

        {field('Nationality',   'nationality')}
        {field('Organisation',  'organisation')}

        <div className="tp-form-field">
          <label className="tp-form-label">Crew ID</label>
          <span className="tp-form-value">{profile.crewId || '—'}</span>
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

      </div>
    </div>
  )
}
