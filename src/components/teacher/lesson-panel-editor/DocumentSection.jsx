import { useState } from 'react'
import DocumentPickerModal from './DocumentPickerModal'
import '../../css/teacher/lesson-panel-editor/DocumentSection.css'

function fileIcon(mimeType) {
  if (!mimeType) return null
  if (mimeType === 'application/pdf') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentSection({ documents, onUpload, onDelete, uploading, isAdmin = false, departmentId = null }) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="doc-section">
      <div className="doc-section-header">
        <span className="doc-section-label">Documents</span>
        {isAdmin && (
          <button
            className="doc-upload-btn"
            onClick={() => setShowPicker(true)}
            disabled={uploading}
          >
            {uploading ? (
              <span className="doc-upload-spinner" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
            {uploading ? 'Uploading…' : 'Add'}
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <p className="doc-empty">No documents attached.</p>
      ) : (
        <ul className="doc-list">
          {documents.map(doc => (
            <li key={doc.id} className="doc-item">
              <span className="doc-icon">{fileIcon(doc.mime_type)}</span>
              <span className="doc-name" title={doc.name}>{doc.name}</span>
              {doc.size_bytes ? <span className="doc-size">{formatBytes(doc.size_bytes)}</span> : null}
              <div className="doc-actions">
                {doc.mime_type === 'application/pdf' ? (
                  <a
                    href={doc.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-action-btn"
                    title="Open in new tab"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                ) : (
                  <a
                    href={doc.download_url}
                    download={doc.name}
                    className="doc-action-btn"
                    title="Download"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </a>
                )}
                {isAdmin && (
                  <button
                    className="doc-action-btn doc-action-btn--delete"
                    title="Remove document"
                    onClick={() => onDelete(doc.id)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {showPicker && (
        <DocumentPickerModal
          departmentId={departmentId}
          onConfirm={onUpload}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
