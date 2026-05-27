import '../../css/shared/media/FileRow.css'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FileRow({ file, index, canWrite, onRename, onDelete, onToggleVrScene }) {
  return (
    <tr className="file-row" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <td className="file-row-name">
        <span className={`file-type-badge file-type-badge--${file.file_type}`}>
          {file.file_type === 'image' ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          ) : file.file_type === 'video' ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )}
        </span>
        <span className="file-name-text">{file.name}</span>
      </td>
      <td className="file-row-location">
        {file.folder === 'public' || file.folder === 'vr_scenes'
          ? <span className="location-badge location-badge--public">Public</span>
          : <span className="location-badge location-badge--class">{file.department_name || '—'}</span>
        }
      </td>
      <td className="file-row-type">
        <span className={`file-type-text file-type-text--${file.file_type}`}>
          {file.file_type === 'image' ? 'Image' : file.file_type === 'video' ? 'Video' : 'Doc'}
        </span>
        {file.is_vr_scene && (
          <span className="file-vr-badge" title="VR Scene">360°</span>
        )}
      </td>
      <td className="file-row-size">{formatBytes(file.size_bytes)}</td>
      <td className="file-row-uploader">{file.uploader_name || '—'}</td>
      <td className="file-row-date">{formatDate(file.uploaded_at)}</td>
      <td className="file-row-actions">
        {file.download_url && (
          file.file_type !== 'document' || file.mime_type === 'application/pdf' ? (
            <a
              className="file-action-btn"
              href={file.download_url}
              target="_blank"
              rel="noreferrer"
              title={file.file_type === 'document' ? 'Open' : 'Download'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          ) : (
            <a
              className="file-action-btn"
              href={file.download_url}
              download={file.name}
              title="Download"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </a>
          )
        )}
        {canWrite && (
          <>
            {onToggleVrScene && file.file_type !== 'document' && (
              <button
                className={`file-action-btn${file.is_vr_scene ? ' file-action-btn--vr-active' : ''}`}
                onClick={() => onToggleVrScene(file)}
                title={file.is_vr_scene ? 'VR Scene (click to unmark)' : 'Mark as VR Scene'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </button>
            )}
            <button className="file-action-btn" onClick={() => onRename(file)} title="Rename">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button className="file-action-btn file-action-btn--delete" onClick={() => onDelete(file)} title="Delete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </>
        )}
      </td>
    </tr>
  )
}
