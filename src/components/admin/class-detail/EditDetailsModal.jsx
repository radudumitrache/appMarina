import '../../css/admin/class-detail/EditDetailsModal.css'

function XIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function EditDetailsModal({ editForm, onChange, onClose, onSave, teachers }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Class Details</h3>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={15} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-2col">
            <div className="form-row">
              <label className="form-label">Class Name</label>
              <input
                className="form-input"
                type="text"
                value={editForm.name}
                onChange={e => onChange('name', e.target.value)}
              />
            </div>
            <div className="form-row">
              <label className="form-label">Teacher</label>
              <select
                className="form-select"
                value={editForm.teacher}
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
              value={editForm.description}
              onChange={e => onChange('description', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Status</label>
            <div className="form-radio-group">
              {['active', 'archived'].map(s => (
                <label
                  key={s}
                  className={`form-radio ${editForm.status === s ? 'form-radio--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="cd-status"
                    value={s}
                    checked={editForm.status === s}
                    onChange={() => onChange('status', s)}
                  />
                  <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={!editForm.name.trim()}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
