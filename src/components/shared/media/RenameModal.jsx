import { useState } from 'react'
import '../../css/shared/media/RenameModal.css'

export default function RenameModal({ file, onClose, onSave }) {
  const [name, setName] = useState(file.name)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || name.trim() === file.name) { onClose(); return }
    setSaving(true)
    await onSave(file.id, name.trim())
    setSaving(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Rename File</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label className="form-label">File Name</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
