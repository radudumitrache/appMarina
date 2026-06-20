import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getMediaFiles, getUploadUrl, uploadToGCS } from '../../../api/media'
import '../../css/trainer/module-panel-editor/DocumentPickerModal.css'

const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
]

function DocIcon({ mimeType }) {
  if (mimeType === 'application/pdf') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    )
  }
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

export default function DocumentPickerModal({ departmentId, onConfirm, onClose }) {
  const [tab,          setTab]          = useState('upload')
  const [folderFiles,  setFolderFiles]  = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState(null)
  const [dragOver,     setDragOver]     = useState(false)
  const fileRef = useRef(null)

  const folderParams = departmentId
    ? { folder: 'class', department_id: departmentId }
    : { folder: 'documents' }

  const folderLabel = departmentId ? 'Department folder' : 'Documents'

  useEffect(() => {
    if (tab !== 'folder') return
    setLoadingFiles(true)
    getMediaFiles(folderParams)
      .then(({ data }) => setFolderFiles(data.filter(f => f.file_type === 'document')))
      .catch(() => {})
      .finally(() => setLoadingFiles(false))
  }, [tab, departmentId])

  async function uploadFile(file) {
    setUploadError(null)
    setUploading(true)
    try {
      const { data: { upload_url, gcs_path } } = await getUploadUrl({
        filename:     file.name,
        content_type: file.type || 'application/octet-stream',
        folder:       'documents',
      })
      const res = await uploadToGCS(upload_url, file)
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      await onConfirm({
        gcs_path,
        name:       file.name,
        mime_type:  file.type || 'application/octet-stream',
        size_bytes: file.size,
      })
      onClose()
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) uploadFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  async function handleSelectExisting(f) {
    setUploading(true)
    try {
      await onConfirm({
        gcs_path:   f.gcs_path,
        name:       f.name,
        mime_type:  f.mime_type,
        size_bytes: f.size_bytes,
      })
      onClose()
    } catch {
      setUploadError('Failed to attach document.')
    } finally {
      setUploading(false)
    }
  }

  return createPortal(
    <div
      className="dpm-overlay"
      onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}
    >
      <div className="dpm-modal">

        <div className="dpm-header">
          <div className="dpm-header-left">
            <span className="dpm-title">Add Document</span>
            <span className="dpm-folder-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {folderLabel}
            </span>
          </div>
          <button className="dpm-close" onClick={onClose} disabled={uploading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="dpm-tabs">
          <button
            className={`dpm-tab${tab === 'upload' ? ' dpm-tab--active' : ''}`}
            onClick={() => setTab('upload')}
          >
            Upload new
          </button>
          <button
            className={`dpm-tab${tab === 'folder' ? ' dpm-tab--active' : ''}`}
            onClick={() => setTab('folder')}
          >
            From {folderLabel.toLowerCase()}
          </button>
        </div>

        <div className="dpm-body">
          {tab === 'upload' && (
            <>
              <div
                className={`dpm-drop-zone${dragOver ? ' dpm-drop-zone--over' : ''}${uploading ? ' dpm-drop-zone--uploading' : ''}`}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <>
                    <span className="dpm-drop-spinner" />
                    <span className="dpm-drop-label">Uploadingâ€¦</span>
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="dpm-drop-icon">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="dpm-drop-label">Click or drag a file here</span>
                    <span className="dpm-drop-hint">PDF, Word, Excel, PowerPoint, CSV, TXT</span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED_MIME.join(',')}
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              {uploadError && <p className="dpm-error">{uploadError}</p>}
            </>
          )}

          {tab === 'folder' && (
            <>
              {loadingFiles ? (
                <p className="dpm-hint">Loadingâ€¦</p>
              ) : folderFiles.length === 0 ? (
                <p className="dpm-hint">No documents in {folderLabel.toLowerCase()} yet.</p>
              ) : (
                <ul className="dpm-file-list">
                  {folderFiles.map(f => (
                    <li key={f.id}>
                      <button
                        className="dpm-file-row"
                        onClick={() => !uploading && handleSelectExisting(f)}
                        disabled={uploading}
                        title={f.name}
                      >
                        <span className="dpm-file-icon"><DocIcon mimeType={f.mime_type} /></span>
                        <span className="dpm-file-name">{f.name}</span>
                        {f.size_bytes && <span className="dpm-file-size">{formatBytes(f.size_bytes)}</span>}
                        <span className="dpm-file-select-icon">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {uploadError && <p className="dpm-error">{uploadError}</p>}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
