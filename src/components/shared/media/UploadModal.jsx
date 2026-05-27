import { useRef, useState } from 'react'
import { getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/shared/media/UploadModal.css'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function computeNewName(existingNames, originalName) {
  const dot  = originalName.lastIndexOf('.')
  const base = dot >= 0 ? originalName.slice(0, dot) : originalName
  const ext  = dot >= 0 ? originalName.slice(dot)   : ''
  let i = 2
  while (existingNames.has(`${base}(${i})${ext}`)) i++
  return `${base}(${i})${ext}`
}

export default function UploadModal({ uploadableFolders, existingFiles = [], onClose, onUploaded }) {
  const fileRef                = useRef(null)
  const [file, setFile]        = useState(null)
  const [folderId, setFolderId] = useState(uploadableFolders[0]?.id ?? '')
  const [progress, setProgress] = useState(null)
  const [error, setError]      = useState('')
  const [conflict, setConflict] = useState(null) // { proposedName }

  const selectedFolder = uploadableFolders.find(f => f.id === folderId)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setError('')
    setConflict(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const doUpload = async (filename) => {
    setConflict(null)
    setProgress('requesting')
    setError('')
    try {
      const { data: urlData } = await getUploadUrl({
        filename,
        content_type: file.type,
        folder:       selectedFolder.folder,
        department_id: selectedFolder.departmentId ?? null,
      })

      setProgress('uploading')
      const res = await uploadToGCS(urlData.upload_url, file)
      if (!res.ok) throw new Error('GCS upload failed')

      setProgress('confirming')
      const { data: mediaFile } = await confirmUpload({
        gcs_path:      urlData.gcs_path,
        filename,
        file_type:     file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        mime_type:     file.type,
        size_bytes:    file.size,
        folder:        selectedFolder.folder,
        department_id: selectedFolder.departmentId ?? null,
      })

      onUploaded(mediaFile)
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setProgress(null)
    }
  }

  const handleUploadClick = () => {
    if (!file || !selectedFolder) return

    const folderFiles = existingFiles.filter(f =>
      selectedFolder.departmentId
        ? f.department === selectedFolder.departmentId
        : f.folder === selectedFolder.folder
    )
    const existingNames = new Set(folderFiles.map(f => f.name))

    if (existingNames.has(file.name)) {
      const proposedName = computeNewName(existingNames, file.name)
      setConflict({ proposedName })
      return
    }

    doUpload(file.name)
  }

  const busy = progress !== null

  return (
    <div className="modal-backdrop" onClick={busy || conflict ? undefined : onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Upload File</h3>
          {!busy && (
            <button className="modal-close" onClick={onClose}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <div className="modal-body">
          <div className="form-row">
            <label className="form-label">Upload to</label>
            <select
              className="form-select"
              value={folderId}
              onChange={e => { setFolderId(e.target.value); setConflict(null) }}
              disabled={busy}
            >
              {uploadableFolders.map(f => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label className="form-label">File</label>
            <div
              className={`upload-drop-zone ${file ? 'upload-drop-zone--loaded' : ''}`}
              onClick={() => !busy && fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="upload-drop-label">
                {file
                  ? `${file.name} — ${formatBytes(file.size)}`
                  : 'Click or drag a file here — image, video, or document'}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          {conflict && (
            <div className="upload-conflict">
              <div className="upload-conflict-body">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-conflict-icon">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div className="upload-conflict-text">
                  <span className="upload-conflict-title">
                    A file named <strong>{file.name}</strong> already exists in this folder.
                  </span>
                  <span className="upload-conflict-sub">
                    It will be uploaded as <strong>{conflict.proposedName}</strong>.
                  </span>
                </div>
              </div>
              <div className="upload-conflict-actions">
                <button className="btn-ghost" onClick={() => setConflict(null)}>Cancel</button>
                <button className="btn-primary" onClick={() => doUpload(conflict.proposedName)}>
                  Upload as {conflict.proposedName}
                </button>
              </div>
            </div>
          )}

          {error && <p className="upload-error">{error}</p>}

          {progress && (
            <p className="upload-status">
              {progress === 'requesting'  && 'Getting upload URL…'}
              {progress === 'uploading'   && 'Uploading to storage…'}
              {progress === 'confirming'  && 'Registering file…'}
            </p>
          )}
        </div>

        {!conflict && (
          <div className="modal-footer">
            <button className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button
              className="btn-primary"
              onClick={handleUploadClick}
              disabled={!file || busy}
            >
              {busy ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
