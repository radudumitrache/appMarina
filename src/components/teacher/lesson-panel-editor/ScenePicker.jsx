import { useState, useEffect, useRef } from 'react'
import { getMediaFiles, getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/teacher/lesson-panel-editor/ScenePicker.css'

export default function ScenePicker({ value, onChange, classroomId }) {
  const [scenes,    setScenes]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const fileRef = useRef()

  const folderParams = classroomId
    ? { folder: 'class', classroom_id: classroomId }
    : { folder: 'public' }

  useEffect(() => {
    getMediaFiles(folderParams)
      .then(({ data }) => setScenes(data.filter(f => f.file_type === 'image')))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [classroomId])

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
        gcs_path:   urlData.gcs_path,
        filename:   file.name,
        file_type:  'image',
        mime_type:  file.type,
        size_bytes: file.size,
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
              Uploading…
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
        <p className="sp-hint">Loading scenes…</p>
      ) : scenes.length === 0 ? (
        <p className="sp-hint">No scenes yet — upload a 360° panorama image to get started.</p>
      ) : (
        <div className="sp-grid">
          {scenes.map(scene => (
            <button
              key={scene.id}
              className={`sp-item${value === scene.id ? ' sp-item--active' : ''}`}
              onClick={() => onChange(scene.id, scene.download_url)}
              title={scene.name}
            >
              <div className="sp-thumb-wrap">
                {scene.download_url
                  ? <img src={scene.download_url} alt={scene.name} className="sp-thumb" />
                  : <div className="sp-thumb-placeholder" />
                }
                {value === scene.id && (
                  <div className="sp-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              <span className="sp-name">{scene.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
