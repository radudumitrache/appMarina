import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getMediaFiles, getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/trainer/module-panel-editor/MediaInsertModal.css'

function computeNewName(existingNames, originalName) {
  const dot  = originalName.lastIndexOf('.')
  const base = dot >= 0 ? originalName.slice(0, dot) : originalName
  const ext  = dot >= 0 ? originalName.slice(dot)   : ''
  let i = 2
  while (existingNames.has(`${base}(${i})${ext}`)) i++
  return `${base}(${i})${ext}`
}

function fileFolderLabel(file) {
  if (file.folder === 'public' || file.folder === 'vr_scenes') return 'Public'
  return file.department_name || 'Department'
}

export default function MediaInsertModal({ initialMode = 'image', imageOnly = false, vrScene = false, departmentId, folderLabel, onInsert, onClose }) {
  const [mode,          setMode]          = useState(imageOnly ? 'image' : initialMode)
  const [files,         setFiles]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [uploading,     setUploading]     = useState(false)
  const [uploadErr,     setUploadErr]     = useState(null)
  const [pendingUpload, setPendingUpload] = useState(null)
  const [previewFile,   setPreviewFile]   = useState(null)
  const fileRef = useRef()

  const folderParams = departmentId
    ? { folder: 'class', department_id: departmentId }
    : { folder: 'public' }

  const displayFolder = folderLabel ?? (departmentId ? 'Department folder' : 'Public')

  useEffect(() => {
    getMediaFiles(folderParams)
      .then(({ data }) => setFiles(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [departmentId])

  const displayed = vrScene
    ? files.filter(f => f.file_type === mode && f.is_vr_scene)
    : files.filter(f => f.file_type === mode && !f.is_vr_scene)

  const doUpload = async (file, filename) => {
    setUploadErr(null)
    setUploading(true)
    try {
      const { data: urlData } = await getUploadUrl({
        filename:     filename,
        content_type: file.type,
        ...folderParams,
      })
      await uploadToGCS(urlData.upload_url, file)
      const { data: mediaFile } = await confirmUpload({
        gcs_path:    urlData.gcs_path,
        filename:    filename,
        file_type:   file.type.startsWith('video/') ? 'video' : 'image',
        mime_type:   file.type,
        size_bytes:  file.size,
        is_vr_scene: vrScene,
        ...folderParams,
      })
      setFiles(prev => [mediaFile, ...prev])
      onInsert(mediaFile.download_url, mediaFile.file_type)
    } catch {
      setUploadErr('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const handleUpload = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const existingNames = new Set(files.map(f => f.name))
    if (existingNames.has(file.name)) {
      const proposedName = computeNewName(existingNames, file.name)
      setPendingUpload({ file, proposedName })
    } else {
      doUpload(file, file.name)
    }
  }

  const confirmPendingUpload = () => {
    const { file, proposedName } = pendingUpload
    setPendingUpload(null)
    doUpload(file, proposedName)
  }

  const cancelPendingUpload = () => {
    setPendingUpload(null)
    fileRef.current.value = ''
  }

  return (
    <>
    <div className="mim-overlay" onMouseDown={e => { if (e.target === e.currentTarget && !uploading) onClose() }}>
      <div className="mim-modal">

        <div className="mim-header">
          <div className="mim-header-left">
            <span className="mim-title">Insert Media</span>
            <span className="mim-folder-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              {displayFolder}
            </span>
          </div>
          <button className="mim-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {!imageOnly && (
          <div className="mim-tabs">
            <button className={`mim-tab${mode === 'image' ? ' mim-tab--active' : ''}`} onClick={() => setMode('image')}>Images</button>
            <button className={`mim-tab${mode === 'video' ? ' mim-tab--active' : ''}`} onClick={() => setMode('video')}>Videos</button>
          </div>
        )}

        <div className="mim-body">
          <div className="mim-upload-bar">
            <button className="mim-upload-btn" onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? (
                <><span className="mim-spinner" />Uploading...</>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload {mode === 'image' ? 'image' : 'video'}
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={mode === 'image' ? 'image/*' : 'video/*'}
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
            {uploadErr && <span className="mim-upload-err">{uploadErr}</span>}
          </div>

          {pendingUpload && (
            <div className="mim-name-conflict">
              <div className="mim-name-conflict-body">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mim-name-conflict-icon">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div className="mim-name-conflict-text">
                  <span className="mim-name-conflict-title">
                    A file named <strong>{pendingUpload.file.name}</strong> already exists.
                  </span>
                  <span className="mim-name-conflict-sub">
                    It will be uploaded as <strong>{pendingUpload.proposedName}</strong>.
                  </span>
                </div>
              </div>
              <div className="mim-name-conflict-actions">
                <button className="mim-name-conflict-cancel" onClick={cancelPendingUpload}>Cancel</button>
                <button className="mim-name-conflict-confirm" onClick={confirmPendingUpload}>
                  Upload as {pendingUpload.proposedName}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <p className="mim-hint">Loading...</p>
          ) : displayed.length === 0 ? (
            <p className="mim-hint">No {mode === 'image' ? 'images' : 'videos'} yet -- upload one above.</p>
          ) : (
            <div className="mim-file-list">
              {displayed.map(f => (
                <div key={f.id} className="mim-file-row-wrap">
                  <button
                    className="mim-file-row"
                    onClick={() => onInsert(f.download_url, f.file_type)}
                    title={f.name}
                  >
                    <span className="mim-file-icon">
                      {f.file_type === 'image' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7"/>
                          <rect x="1" y="5" width="15" height="14" rx="2"/>
                        </svg>
                      )}
                    </span>
                    <span className="mim-file-name">{f.name}</span>
                    <span className="mim-file-folder">{fileFolderLabel(f)}</span>
                    <span className="mim-file-select-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </span>
                  </button>
                  <button
                    className="mim-preview-btn"
                    onClick={() => setPreviewFile(previewFile?.id === f.id ? null : f)}
                    title="Preview"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {uploading && (
          <div className="mim-upload-overlay">
            <div className="mim-upload-overlay-spinner" />
            <span className="mim-upload-overlay-label">Uploading image...</span>
          </div>
        )}
      </div>
    </div>

    {previewFile && createPortal(
      <div className="mim-lightbox-overlay" onClick={() => setPreviewFile(null)}>
        <div className="mim-lightbox-box" onClick={e => e.stopPropagation()}>
          <div className="mim-lightbox-header">
            <span className="mim-lightbox-title">{previewFile.name}</span>
            <button className="mim-lightbox-close" onClick={() => setPreviewFile(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {previewFile.file_type === 'image' ? (
            <img src={previewFile.download_url} alt={previewFile.name} className="mim-lightbox-img" />
          ) : (
            <video src={previewFile.download_url} className="mim-lightbox-video" controls />
          )}
          <div className="mim-lightbox-footer">
            <button
              className="mim-lightbox-insert-btn"
              onClick={() => { onInsert(previewFile.download_url, previewFile.file_type); setPreviewFile(null) }}
            >
              Insert
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}
