import DatePicker from './DatePicker'
import '../../css/admin/classes/ClassFormModal.css'

function generateCode() {
  const year = new Date().getFullYear()
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `CLS-${year}-${rand}`
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function ClassFormModal({ mode, form, errors = {}, onChange, onClose, onSave, trainers }) {
  const err = field => errors[field]
    ? <span className="form-field-error">{errors[field]}</span>
    : null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? 'New Department' : 'Edit Department'}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>
        <div className="modal-body modal-body--scroll">

          {errors.non_field_errors && (
            <div className="form-error-banner">{errors.non_field_errors}</div>
          )}

          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Department Name</label>
              <input
                className={`form-input${err('name') ? ' form-input--error' : ''}`}
                type="text"
                placeholder="e.g. Maritime Navigation — Alpha"
                value={form.name}
                onChange={e => onChange('name', e.target.value)}
              />
              {err('name')}
            </div>
            <div className="form-row">
              <label className="form-label">Department Code</label>
              <div className="form-input-with-btn">
                <input
                  className={`form-input${err('code') ? ' form-input--error' : ''}`}
                  type="text"
                  placeholder="e.g. MN-2025-A"
                  value={form.code}
                  onChange={e => onChange('code', e.target.value)}
                />
                <button type="button" className="btn-generate" onClick={() => onChange('code', generateCode())}>
                  Generate
                </button>
              </div>
              {err('code')}
            </div>
          </div>

          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Subject</label>
              <input
                className={`form-input${err('subject') ? ' form-input--error' : ''}`}
                type="text"
                placeholder="e.g. Bridge Navigation"
                value={form.subject}
                onChange={e => onChange('subject', e.target.value)}
              />
              {err('subject')}
            </div>
            <div className="form-row">
              <label className="form-label">trainer</label>
              <select
                className={`form-select${err('trainer') ? ' form-input--error' : ''}`}
                value={form.trainer ?? ''}
                onChange={e => onChange('trainer', Number(e.target.value))}
              >
                <option value="">— select trainer —</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : t.username}
                  </option>
                ))}
              </select>
              {err('trainer')}
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Status</label>
            <div className="form-radio-group">
              {['active', 'archived'].map(s => (
                <label key={s} className={`form-radio ${form.status === s ? 'form-radio--active' : ''}`}>
                  <input type="radio" name="class-status" value={s} checked={form.status === s} onChange={() => onChange('status', s)} />
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Start Date</label>
              <DatePicker
                value={form.start_date}
                onChange={v => {
                  onChange('start_date', v)
                  if (form.end_date && v > form.end_date) onChange('end_date', '')
                }}
                placeholder="e.g. Jan 1, 2025"
                hasError={!!errors.start_date}
                max={form.end_date || undefined}
              />
              {err('start_date')}
            </div>
            <div className="form-row">
              <label className="form-label">End Date</label>
              <DatePicker
                value={form.end_date}
                onChange={v => {
                  onChange('end_date', v)
                  if (form.start_date && v < form.start_date) onChange('start_date', '')
                }}
                placeholder="e.g. Jun 30, 2025"
                hasError={!!errors.end_date}
                min={form.start_date || undefined}
              />
              {err('end_date')}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave}>
            {mode === 'create' ? 'Create Department' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
