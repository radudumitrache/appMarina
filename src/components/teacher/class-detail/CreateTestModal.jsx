import { useState } from 'react'
import { createTest } from '../../../api/tests'
import '../../css/teacher/class-detail/AssignLessonModal.css'

const EMPTY = { title: '', due_date: '', time_limit_minutes: '30' }

export default function CreateTestModal({ classId, onClose, onCreated }) {
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const handleSave = async () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.time_limit_minutes || isNaN(Number(form.time_limit_minutes))) errs.time_limit_minutes = 'Enter a valid number.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { data } = await createTest({
        title:              form.title.trim(),
        classroom:          classId,
        time_limit_minutes: Number(form.time_limit_minutes),
        due_date:           form.due_date || null,
      })
      onCreated(data)
      onClose()
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object') {
        setErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setErrors({ title: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const err = field => errors[field]
    ? <span className="alm-field-error">{errors[field]}</span>
    : null

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal alm-modal--form" onClick={e => e.stopPropagation()}>
        <div className="alm-header">
          <h3 className="alm-title">New Test</h3>
          <button className="alm-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="alm-form-body">
          <div className="alm-form-row">
            <label className="alm-label">Title <span className="alm-required">*</span></label>
            <input
              className={`alm-input${errors.title ? ' alm-input--error' : ''}`}
              type="text"
              placeholder="e.g. Mid-term Navigation Assessment"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
            {err('title')}
          </div>

          <div className="alm-form-2col">
            <div className="alm-form-row">
              <label className="alm-label">Time Limit (minutes) <span className="alm-required">*</span></label>
              <input
                className={`alm-input${errors.time_limit_minutes ? ' alm-input--error' : ''}`}
                type="number"
                min="1"
                placeholder="30"
                value={form.time_limit_minutes}
                onChange={e => set('time_limit_minutes', e.target.value)}
              />
              {err('time_limit_minutes')}
            </div>
            <div className="alm-form-row">
              <label className="alm-label">Due Date</label>
              <input
                className="alm-input"
                type="date"
                value={form.due_date}
                onChange={e => set('due_date', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="alm-footer">
          <button className="alm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="alm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating…' : 'Create Test'}
          </button>
        </div>
      </div>
    </div>
  )
}
