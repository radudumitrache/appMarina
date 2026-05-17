import '../../css/admin/lessons/LessonFormPanel.css'
import { useAuth } from '../../../auth/AuthContext'
import Dropdown from '../../shared/Dropdown'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function LessonFormPanel({ mode, form, onChange, onClose, onSave, departments = [], difficulties, classes = [], organisations = [] }) {
  const { user } = useAuth()
  const isSuperAdmin = user?.is_staff
  const toggleDept = (id) => {
    const prev = form.department_ids ?? []
    onChange('department_ids', prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  return (
    <>
      <div className="panel-backdrop" onClick={onClose} />
      <aside className="lesson-panel">
        <div className="panel-header">
          <h3 className="panel-title">{mode === 'create' ? 'New Lesson' : 'Edit Lesson'}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="panel-body">
          <div className="form-row">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Helm Control Basics"
              value={form.title}
              onChange={e => onChange('title', e.target.value)}
            />
          </div>

          {departments.length > 0 && (
            <div className="form-row">
              <label className="form-label">Departments</label>
              <div className="form-check-list">
                {departments.map(d => {
                  const checked = (form.department_ids ?? []).includes(d.id)
                  return (
                    <label key={d.id} className={`form-check-item ${checked ? 'form-check-item--active' : ''}`} onClick={() => toggleDept(d.id)}>
                      <span className={`form-check-box ${checked ? 'form-check-box--checked' : ''}`}>
                        {checked && (
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                      <span className="form-check-label">{d.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="form-row-2col">
            <div className="form-row">
              <label className="form-label">Duration (minutes)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                placeholder="e.g. 45"
                value={form.duration_minutes}
                onChange={e => onChange('duration_minutes', parseInt(e.target.value) || '')}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Difficulty</label>
              <Dropdown
                value={form.difficulty}
                onChange={v => onChange('difficulty', v)}
                options={difficulties.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) }))}
              />
            </div>
          </div>

          <div className="form-row">
            <label className="form-label">Visibility</label>
            <Dropdown
              value={form.visibility}
              onChange={v => {
                onChange('visibility', v)
                if (v !== 'class') onChange('classroom', null)
              }}
              options={[
                { value: 'class', label: 'Class only' },
                { value: 'public', label: 'Public' },
              ]}
            />
          </div>

          {form.visibility === 'class' && (
            <div className="form-row">
              <label className="form-label">Class</label>
              <Dropdown
                value={form.classroom ?? null}
                onChange={v => onChange('classroom', v)}
                placeholder="— Select a class —"
                options={classes.map(c => ({ value: c.id, label: `${c.name}${c.code ? ` (${c.code})` : ''}` }))}
              />
            </div>
          )}

          {isSuperAdmin && organisations.length > 0 && (
            <div className="form-row">
              <label className="form-label">Organisation</label>
              <Dropdown
                value={form.organisation_id ?? null}
                onChange={v => onChange('organisation_id', v)}
                placeholder="— None —"
                options={organisations.map(o => ({ value: o.id, label: o.name }))}
              />
            </div>
          )}
        </div>

        <div className="panel-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={!form.title.trim() || (form.visibility === 'class' && !form.classroom)}>
            {mode === 'create' ? 'Create Lesson' : 'Save Changes'}
          </button>
        </div>
      </aside>
    </>
  )
}
