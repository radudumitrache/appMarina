import '../../css/admin/classes/ClassFormModal.css'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function toggleItem(arr, id) {
  return arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]
}

export default function ClassFormModal({ mode, form, onChange, onClose, onSave, teachers, allStudents, allLessons }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? 'New Class' : 'Edit Class'}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>
        <div className="modal-body modal-body--scroll">
          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Class Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. SEC-2025-A"
                value={form.name}
                onChange={e => onChange('name', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Teacher</label>
              <select
                className="form-select"
                value={form.teacher}
                onChange={e => onChange('teacher', e.target.value)}
              >
                {teachers.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Main cohort — Spring 2025"
              value={form.description}
              onChange={e => onChange('description', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <div className="form-radio-group">
              {['active', 'archived'].map(s => (
                <label
                  key={s}
                  className={`form-radio ${form.status === s ? 'form-radio--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="class-status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => onChange('status', s)}
                  />
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Students</label>
              <div className="checklist">
                {allStudents.map(s => (
                  <label
                    key={s.id}
                    className={`checklist-item ${form.students.includes(s.id) ? 'checklist-item--checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.students.includes(s.id)}
                      onChange={() => onChange('students', toggleItem(form.students, s.id))}
                    />
                    <span className="checklist-check">
                      {form.students.includes(s.id) && <CheckIcon />}
                    </span>
                    <span className="checklist-label">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Lessons</label>
              <div className="checklist">
                {allLessons.map(l => (
                  <label
                    key={l.id}
                    className={`checklist-item ${form.lessons.includes(l.id) ? 'checklist-item--checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.lessons.includes(l.id)}
                      onChange={() => onChange('lessons', toggleItem(form.lessons, l.id))}
                    />
                    <span className="checklist-check">
                      {form.lessons.includes(l.id) && <CheckIcon />}
                    </span>
                    <span className="checklist-label">{l.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={!form.name.trim()}>
            {mode === 'create' ? 'Create Class' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
