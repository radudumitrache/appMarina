import '../../css/admin/tests/TestFormPanel.css'
import MultiSelectDropdown from '../../shared/MultiSelectDropdown'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function TestFormPanel({ form, onChange, onClose, onSave, departments = [] }) {
  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="module-panel">
        <div className="panel-header">
          <h3 className="panel-title">New Test</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="panel-body">
          <div className="form-row">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Navigation Fundamentals Quiz"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Time Limit (minutes)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g. 30"
              value={form.time_limit_minutes}
              onChange={e => onChange('time_limit_minutes', parseInt(e.target.value) || '')}
            />
          </div>

          {departments.length > 0 && (
            <div className="form-row">
              <label className="form-label">Departments (optional)</label>
              <MultiSelectDropdown
                value={form.department_ids ?? []}
                onChange={ids => onChange('department_ids', ids)}
                placeholder="-- Organisation-wide --"
                options={departments.map(d => ({ value: d.id, label: `${d.name}${d.code ? ` (${d.code})` : ''}` }))}
              />
            </div>
          )}
        </div>

        <div className="panel-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!form.title.trim()}
          >
            Create Test
          </button>
        </div>
      </aside>
    </>
  )
}
