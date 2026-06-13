import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getMediaFiles, getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/teacher/module-panel-editor/ScenePicker.css'

function folderLabel(scene) {
  if (scene.folder === 'public' || scene.folder === 'vr_scenes') return 'Public'
  return scene.department_name || 'Department'
}

export default function ScenePicker({ value, onChange, departmentId, folderName }) {
  const [scenes,    setScenes]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const [previewScene, setPreviewScene] = useState(null)
  const fileRef = useRef()

  const folderParams = departmentId
    ? { folder: 'class', department_id: departmentId }
    : { folder: 'public' }

  const uploadDestLabel = folderName ?? (departmentId ? 'the department folder' : 'Public')

  useEffect(() => {
    getMediaFiles(folderParams)
      .then(({ data }) => setScenes(data.filter(f => f.file_type === 'image' && f.is_vr_scene)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [departmentId])

  const handleFileChange = async e => {
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
        gcs_path:    urlData.gcs_path,
        filename:    file.name,
        file_type:   'image',
        mime_type:   file.type,
        size_bytes:  file.size,
        is_vr_scene: true,
        ...folderParams,
      })
      setScenes(prev => [mediaFile, ...prev])
      onChange(mediaFile.id, mediaFile.download_url)
    } catch {
      setUploadErr('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  return (
    <div className="sp-root">
      <div className="sp-toolbar">
        <button
          className="sp-upload-btn"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="sp-upload-spinner" />
              Uploadingâ€¦
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload scene
            </>
          )}
        </button>
        <span className="sp-upload-dest">Saved to: <strong>{uploadDestLabel}</strong></span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {uploadErr && <p className="sp-error">{uploadErr}</p>}

      {loading ? (
        <p className="sp-hint">Loading scenesâ€¦</p>
      ) : scenes.length === 0 ? (
        <p className="sp-hint">No VR scenes yet â€” upload a 360Â° panorama and mark it as a VR Scene.</p>
      ) : (
        <div className="sp-list">
          {scenes.map(scene => (
            <div key={scene.id} className="sp-list-row">
              <button
                className={`sp-list-item${value === scene.id ? ' sp-list-item--active' : ''}`}
                onClick={() => onChange(scene.id, scene.download_url)}
                title={scene.name}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="sp-list-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span className="sp-list-name">{scene.name}</span>
                <span className="sp-folder-badge">{folderLabel(scene)}</span>
                {value === scene.id && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sp-list-check">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <button
                className="sp-preview-btn"
                onClick={() => setPreviewScene(previewScene?.id === scene.id ? null : scene)}
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

      {previewScene && previewScene.download_url && createPortal(
        <div className="sp-preview-overlay" onClick={() => setPreviewScene(null)}>
          <div className="sp-preview-box" onClick={e => e.stopPropagation()}>
            <div className="sp-preview-header">
              <span className="sp-preview-title">{previewScene.name}</span>
              <button className="sp-preview-close" onClick={() => setPreviewScene(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <img src={previewScene.download_url} alt={previewScene.name} className="sp-preview-img" />
            <div className="sp-preview-footer">
              <button
                className="sp-preview-select-btn"
                onClick={() => { onChange(previewScene.id, previewScene.download_url); setPreviewScene(null) }}
              >
                Use this scene
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
