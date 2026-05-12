import { useState } from 'react'
import { createPortal } from 'react-dom'
import '../../css/shared/media/RenameModal.css'

function splitNameExt(name) {
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return [name, '']
  return [name.slice(0, dot), name.slice(dot)]
}

function computeUniqueName(desiredName, files, currentFileId) {
  const siblings = files.filter(f => f.id !== currentFileId)
  const taken = new Set(siblings.map(f => f.name))
  if (!taken.has(desiredName)) return null

  const [base, ext] = splitNameExt(desiredName)
  let counter = 1
  let candidate
  do {
    candidate = `${base} (${counter})${ext}`
    counter++
  } while (taken.has(candidate))
  return candidate
}

export default function RenameModal({ file, files = [], onClose, onSave }) {
  const [origBase, ext] = splitNameExt(file.name)
  const [base, setBase] = useState(origBase)
  const [saving, setSaving] = useState(false)
  const [conflict, setConflict] = useState(null)

  const scopedFiles = files.filter(f =>
    f.folder === file.folder && f.classroom === file.classroom
  )

  const handleSave = async () => {
    const trimmed = base.trim()
    if (!trimmed) { onClose(); return }
    const fullName = trimmed + ext
    if (fullName === file.name) { onClose(); return }

    const deduplicated = computeUniqueName(fullName, scopedFiles, file.id)
    if (deduplicated) {
      setConflict({ desired: fullName, deduplicated })
      return
    }

    setSaving(true)
    await onSave(file.id, fullName)
    setSaving(false)
  }

  const handleConfirmConflict = async () => {
    setSaving(true)
    await onSave(file.id, conflict.deduplicated)
    setSaving(false)
  }

  if (conflict) {
    return createPortal(
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Name Already Taken</h3>
            <button className="modal-close" onClick={onClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <p className="rename-conflict-msg">
              A file named <strong>{conflict.desired}</strong> already exists in this folder.
            </p>
            <p className="rename-conflict-msg">
              The file will be saved as <strong>{conflict.deduplicated}</strong> instead.
            </p>
            <p className="rename-conflict-msg rename-conflict-hint">
              Do you want to continue?
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setConflict(null)}>Go Back</button>
            <button className="btn-primary" onClick={handleConfirmConflict} disabled={saving}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
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
            <div className="rename-input-wrap">
              <input
                className="form-input rename-base-input"
                type="text"
                value={base}
                onChange={e => setBase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              {ext && <span className="rename-ext">{ext}</span>}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!base.trim() || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
