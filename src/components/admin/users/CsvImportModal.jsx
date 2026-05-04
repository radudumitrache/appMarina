import { useRef } from 'react'
import '../../css/admin/users/UserFormModal.css'
import '../../css/admin/users/CsvImportModal.css'

export default function CsvImportModal({ csvRows, onClose, onImport, onFileParsed, onDrop, onDownloadTemplate }) {
  const fileRef = useRef(null)

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
            Columns: <code className="csv-code">name, email, role, class</code>.
            {' '}Role must be <code className="csv-code">student</code> or <code className="csv-code">teacher</code>.{' '}
            <button className="link-btn" onClick={onDownloadTemplate}>Download template</button>
          </p>
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
                      <th>Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((r, i) => (
                      <tr key={i}>
                        <td className="user-name">{r.name}</td>
                        <td className="user-email">{r.email}</td>
                        <td><span className={`role-badge role-badge--${r.role}`}>{r.role}</span></td>
                        <td className="user-class">{r.className}</td>
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
            onClick={onImport}
            disabled={csvRows.length === 0}
          >
            Import {csvRows.length > 0 ? `${csvRows.length} Users` : 'Users'}
          </button>
        </div>
      </div>
    </div>
  )
}
