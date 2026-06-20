import '../../css/admin/classes/ClassFormModal.css'
import '../../css/trainer/classes/ClassFormModal.css'
import DatePicker from '../../admin/classes/DatePicker'

const PREFIXES = ['MN', 'BR', 'SF', 'NG', 'EG', 'CR', 'CM', 'DC', 'MC', 'NV']
const SUFFIXES = ['A', 'B', 'C', 'D', 'E', 'X', 'Y', 'Z', '1', '2']

function generateCode() {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)]
  const year   = new Date().getFullYear()
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)]
  return `${prefix}-${year}-${suffix}`
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function Label({ children, required }) {
  return (
    <label className="form-label">
      {children}{required && <span className="form-label-required">*</span>}
    </label>
  )
}

export default function ClassFormModal({ mode = 'create', form, errors = {}, onChange, onClose, onSave, saving }) {
  const err = field => errors[field]
    ? <span className="form-field-error">{errors[field]}</span>
    : null

  const isEdit = mode === 'edit'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Department' : 'New Department'}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>
        <div className="modal-body modal-body--scroll">

          {errors.non_field_errors && (
            <div className="form-error-banner">{errors.non_field_errors}</div>
          )}

          <div className="form-2col">
            <div className="form-row">
              <Label required>Department Name</Label>
              <input
                className={`form-input${errors.name ? ' form-input--error' : ''}`}
                type="text"
                placeholder="e.g. Maritime Navigation — Alpha"
                value={form.name}
                onChange={e => onChange('name', e.target.value)}
              />
              {err('name')}
            </div>
            <div className="form-row">
              <Label required>Department Code</Label>
              <div className="form-code-wrap">
                <input
                  className={`form-input form-input--code${errors.code ? ' form-input--error' : ''}`}
                  type="text"
                  placeholder="e.g. MN-2025-A"
                  value={form.code}
                  onChange={e => onChange('code', e.target.value)}
                />
                <button
                  type="button"
                  className="form-gen-btn"
                  onClick={() => onChange('code', generateCode())}
                  title="Generate random code"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"/>
                    <line x1="4" y1="20" x2="21" y2="3"/>
                    <polyline points="21 16 21 21 16 21"/>
                    <line x1="15" y1="15" x2="21" y2="21"/>
                  </svg>
                </button>
              </div>
              {err('code')}
            </div>
          </div>

          <div className="form-2col">
            <div className="form-row">
              <Label required>Subject</Label>
              <input
                className={`form-input${errors.subject ? ' form-input--error' : ''}`}
                type="text"
                placeholder="e.g. Bridge Navigation"
                value={form.subject}
                onChange={e => onChange('subject', e.target.value)}
              />
              {err('subject')}
            </div>
          </div>

          <div className="form-2col">
            <div className="form-row">
              <Label required>Start Date</Label>
              <DatePicker
                value={form.start_date}
                onChange={val => {
                  onChange('start_date', val)
                  if (form.end_date && val > form.end_date) onChange('end_date', '')
                }}
                placeholder="Start date"
                hasError={!!errors.start_date}
                max={form.end_date || undefined}
              />
              {err('start_date')}
            </div>
            <div className="form-row">
              <Label required>End Date</Label>
              <DatePicker
                value={form.end_date}
                onChange={val => {
                  onChange('end_date', val)
                  if (form.start_date && val < form.start_date) onChange('start_date', '')
                }}
                placeholder="End date"
                hasError={!!errors.end_date}
                min={form.start_date || undefined}
              />
              {err('end_date')}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Department'}
          </button>
        </div>
      </div>
    </div>
  )
}
