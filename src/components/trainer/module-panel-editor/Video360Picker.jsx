import { useState, useEffect, useRef } from 'react'
import { getMediaFiles, getUploadUrl, uploadToGCS, confirmUpload } from '../../../api/media'
import '../../css/trainer/module-panel-editor/ScenePicker.css'

export default function Video360Picker({ value, onChange, departmentId, folderName }) {
  const [videos,    setVideos]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState(null)
  const fileRef = useRef()

  const folderParams = departmentId
    ? { folder: 'class', department_id: departmentId }
    : { folder: 'public' }

  const uploadDestLabel = folderName ?? (departmentId ? 'the department folder' : 'Public')

  useEffect(() => {
    getMediaFiles(folderParams)
      .then(({ data }) => setVideos(data.filter(f => f.file_type === '360video')))
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
        gcs_path:   urlData.gcs_path,
        filename:   file.name,
        file_type:  '360video',
        mime_type:  file.type,
        size_bytes: file.size,
        ...folderParams,
      })
      setVideos(prev => [mediaFile, ...prev])
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
              Uploading...
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload 360° video
            </>
          )}
        </button>
        <span className="sp-upload-dest">Saved to: <strong>{uploadDestLabel}</strong></span>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {uploadErr && <p className="sp-error">{uploadErr}</p>}

      {loading ? (
        <p className="sp-hint">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="sp-hint">No 360° videos yet — upload a spherical video file.</p>
      ) : (
        <div className="sp-list">
          {videos.map(video => (
            <div key={video.id} className="sp-list-row">
              <button
                className={`sp-list-item${value === video.id ? ' sp-list-item--active' : ''}`}
                onClick={() => onChange(video.id, video.download_url)}
                title={video.name}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="sp-list-icon">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none"/>
                </svg>
                <span className="sp-list-name">{video.name}</span>
                <span className="sp-folder-badge">{video.folder === 'public' ? 'Public' : (video.department_name || 'Department')}</span>
                {value === video.id && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sp-list-check">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
