import '../../css/admin/users/UserFormModal.css'
import Dropdown from '../../shared/Dropdown'
import { useAuth } from '../../../auth/AuthContext'

export default function UserFormModal({ mode, form, onChange, onClose, onSave, saving, error, organisations, departments }) {
  const { user } = useAuth()
  const isSuperAdmin = user?.is_staff
  const toggleDept = (id) => {
    const current = form.department_ids ?? []
    const next = current.includes(id) ? current.filter(d => d !== id) : [...current, id]
    onChange('department_ids', next)
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
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. janesmith"
              value={form.username}
              onChange={e => onChange('username', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="e.g. jane@hansa360.com"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Role</label>
            <div className="form-radio-group">
              {(isSuperAdmin ? ['student', 'teacher', 'admin'] : ['student', 'teacher']).map(r => (
                <label
                  key={r}
                  className={`form-radio ${form.role === r ? 'form-radio--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="user-role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => onChange('role', r)}
                  />
                  <span>{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
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

          {/* ── Crew ID (students and teachers only) ── */}
          {form.role !== 'admin' && (
            <div className="form-row">
              <label className="form-label">
                Crew ID
                <span className="form-hint"> — optional</span>
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g. CREW-2024-001"
                value={form.crew_id}
                onChange={e => onChange('crew_id', e.target.value)}
              />
            </div>
          )}

          {/* ── Organisation (superadmin only; required when creating an admin) ── */}
          {isSuperAdmin && (
            <div className="form-row">
              <label className="form-label">
                Organisation
                {form.role === 'admin' && <span className="form-hint" style={{ color: 'var(--error)' }}> — required for admins</span>}
              </label>
              <Dropdown
                value={form.organisation_id}
                onChange={val => onChange('organisation_id', val)}
                placeholder="— None —"
                options={[
                  { value: null, label: '— None —' },
                  ...organisations.map(o => ({ value: o.id, label: o.name })),
                ]}
              />
            </div>
          )}

          {/* ── Departments (not applicable for admin role) ── */}
          {form.role !== 'admin' && (
            <div className="form-row">
              <label className="form-label">
                Departments
                <span className="form-hint"> — select one or more</span>
              </label>
              {departments.length === 0 ? (
                <p className="form-empty-note">No departments created yet.</p>
              ) : (
                <div className="form-check-list">
                  {departments.map(dept => {
                    const checked = (form.department_ids ?? []).includes(dept.id)
                    return (
                      <label
                        key={dept.id}
                        className={`form-check-item${checked ? ' form-check-item--active' : ''}`}
                        onClick={() => toggleDept(dept.id)}
                      >
                        <span className={`form-check-box${checked ? ' form-check-box--checked' : ''}`}>
                          {checked && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span className="form-check-label">{dept.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            className="btn-primary"
            onClick={onSave}
            disabled={saving || !form.name.trim() || !form.username.trim() || !form.email.trim() || (isSuperAdmin && form.role === 'admin' && !form.organisation_id)}
          >
            {saving ? 'Saving…' : mode === 'create' ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
