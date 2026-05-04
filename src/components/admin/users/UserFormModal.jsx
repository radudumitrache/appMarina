import '../../css/admin/users/UserFormModal.css'

export default function UserFormModal({ mode, form, onChange, onClose, onSave, classes }) {
  const handleRoleChange = (role) => {
    onChange('role', role)
    onChange('className', role === 'teacher' ? '—' : classes[0])
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? 'New User' : 'Edit User'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Jane Smith"
              value={form.name}
              onChange={e => onChange('name', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="e.g. jane@seafarer.edu"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Role</label>
            <div className="form-radio-group">
              {['student', 'teacher'].map(r => (
                <label
                  key={r}
                  className={`form-radio ${form.role === r ? 'form-radio--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="user-role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => handleRoleChange(r)}
                  />
                  <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          {form.role === 'student' && (
            <div className="form-row">
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={form.className}
                onChange={e => onChange('className', e.target.value)}
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div className="form-row">
            <label className="form-label">
              Password
              {mode === 'edit' && <span className="form-hint"> — leave blank to keep current</span>}
            </label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => onChange('password', e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={!form.name.trim() || !form.email.trim()}
          >
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
