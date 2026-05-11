import { useState, useEffect, useRef } from 'react'
import { getMediaFiles, getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/teacher/lesson-panel-editor/MediaInsertModal.css'

export default function MediaInsertModal({ initialMode = 'image', imageOnly = false, classroomId, folderLabel, onInsert, onClose }) {
  const [mode,      setMode]      = useState(imageOnly ? 'image' : initialMode)
  const [files,     setFiles]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const fileRef = useRef()

  const folderParams = classroomId
    ? { folder: 'class', classroom_id: classroomId }
    : { folder: 'public' }

  const displayFolder = folderLabel ?? (classroomId ? 'Class folder' : 'Public')

  useEffect(() => {
    getMediaFiles(folderParams)
      .then(({ data }) => setFiles(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classroomId])

  const displayed = files.filter(f => f.file_type === mode)

  const handleUpload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr(null)
    setUploading(true)
    try {
      const { data: urlData } = await getUploadUrl({
        filename:     file.name,
        content_type: file.type,
        ...folderParams,
      })
      await uploadToGCS(urlData.upload_url, file)
      const { data: mediaFile } = await confirmUpload({
        gcs_path:   urlData.gcs_path,
        filename:   file.name,
        file_type:  file.type.startsWith('video/') ? 'video' : 'image',
        mime_type:  file.type,
        size_bytes: file.size,
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

  return (
    <div className="mim-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
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
                <><span className="mim-spinner" />Uploading…</>
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

          {loading ? (
            <p className="mim-hint">Loading…</p>
          ) : displayed.length === 0 ? (
            <p className="mim-hint">No {mode === 'image' ? 'images' : 'videos'} yet — upload one above.</p>
          ) : (
            <div className={`mim-grid mim-grid--${mode}`}>
              {displayed.map(f => (
                <button
                  key={f.id}
                  className="mim-item"
                  onClick={() => onInsert(f.download_url, f.file_type)}
                  title={f.name}
                >
                  <div className="mim-thumb-wrap">
                    {f.file_type === 'image'
                      ? <img src={f.download_url} alt={f.name} className="mim-thumb" />
                      : <video src={f.download_url} className="mim-thumb" muted />
                    }
                  </div>
                  <span className="mim-name">{f.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
