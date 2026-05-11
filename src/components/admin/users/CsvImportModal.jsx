import { useRef, useState } from 'react'
import '../../css/admin/users/UserFormModal.css'
import '../../css/admin/users/CsvImportModal.css'

export default function CsvImportModal({ csvRows, onClose, onImport, onFileParsed, onDownloadTemplate }) {
  const fileRef              = useRef(null)
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => onFileParsed(evt.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => onFileParsed(evt.target.result)
    reader.readAsText(file)
  }

  const canImport = csvRows.length > 0 && password.length >= 8

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Import Users from CSV</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p className="csv-hint">
            Columns: <code className="csv-code">name, email, role</code>.
            {' '}Role must be <code className="csv-code">student</code> or <code className="csv-code">teacher</code>.{' '}
            <button className="link-btn" onClick={onDownloadTemplate}>Download template</button>
          </p>

          <div className="form-row">
            <label className="form-label">
              PASSWORD FOR ALL IMPORTED USERS <span className="form-hint">(min. 8 characters)</span>
            </label>
            <div className="csv-password-wrap">
              <input
                className="form-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Set a password for all imported accounts"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="csv-pwd-toggle"
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
              >
                {showPwd ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            className={`csv-drop-zone ${csvRows.length > 0 ? 'csv-drop-zone--loaded' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span className="csv-drop-label">
              {csvRows.length > 0
                ? `${csvRows.length} rows parsed — click to replace`
                : 'Click to select or drop a CSV file'}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {csvRows.length > 0 && (
            <div className="csv-preview">
              <p className="csv-preview-label">{csvRows.length} users ready to import</p>
              <div className="csv-preview-scroll">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((r, i) => (
                      <tr key={i}>
                        <td className="user-name">{r.name}</td>
                        <td className="user-email">{r.email}</td>
                        <td><span className={`role-badge role-badge--${r.role}`}>{r.role}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={() => onImport(password)}
            disabled={!canImport}
          >
            Import {csvRows.length > 0 ? `${csvRows.length} Users` : 'Users'}
          </button>
        </div>
      </div>
    </div>
  )
}
