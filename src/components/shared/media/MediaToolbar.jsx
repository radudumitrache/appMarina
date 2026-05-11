import '../../css/shared/media/MediaToolbar.css'

export default function MediaToolbar({ title, count, search, onSearch, onUpload, canUpload }) {
  return (
    <div className="media-toolbar">
      <div className="media-toolbar-left">
        <h1 className="media-toolbar-title">{title}</h1>
        <span className="media-toolbar-count">{count} file{count !== 1 ? 's' : ''}</span>
      </div>
      <div className="media-toolbar-right">
        <div className="media-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="media-search"
            type="text"
            placeholder="Search files…"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        {canUpload && (
          <button className="media-upload-btn" onClick={onUpload}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </button>
        )}
      </div>
    </div>
  )
}
