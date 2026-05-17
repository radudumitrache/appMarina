import '../../css/admin/classes/ClassFormModal.css'

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function OrgFormModal({ mode, entityLabel = 'Organisation', name, error, onChange, onClose, onSave, saving }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{mode === 'create' ? `New ${entityLabel}` : `Rename ${entityLabel}`}</h3>
          <button className="modal-close" onClick={onClose}><XIcon /></button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error-banner">{error}</div>}
          <div className="form-row">
            <label className="form-label">{entityLabel} Name</label>
            <input
              className={`form-input${error ? ' form-input--error' : ''}`}
              type="text"
              placeholder={`e.g. ${entityLabel === 'Department' ? 'Navigation & Seamanship' : 'Hansa Maritime Academy'}`}
              value={name}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !saving && onSave()}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={onSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
