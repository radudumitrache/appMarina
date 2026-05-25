import '../../css/shared/media/MediaToolbar.css'

const TYPE_CHIPS = [
  { id: 'all',      label: 'All types' },
  { id: 'image',    label: 'Images',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'video',    label: 'Videos',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
  { id: 'document', label: 'Docs',
    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
]

export default function MediaToolbar({
  title, count, search, onSearch, onUpload, canUpload,
  filterType = 'all', onFilterType,
  filterVrScene = false, onFilterVrScene,
}) {
  const hasFilters = onFilterType || onFilterVrScene

  return (
    <div className="media-toolbar">
      <div className="media-toolbar-top">
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

      {hasFilters && (
        <div className="media-filter-bar">
          <span className="media-filter-label">Filter</span>

          {onFilterType && TYPE_CHIPS.map(chip => (
            <button
              key={chip.id}
              className={`media-filter-chip${filterType === chip.id ? ' media-filter-chip--active' : ''}`}
              onClick={() => onFilterType(chip.id)}
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}

          {onFilterType && onFilterVrScene && (
            <span className="media-filter-divider" />
          )}

          {onFilterVrScene && (
            <button
              className={`media-filter-chip media-filter-chip--vr${filterVrScene ? ' media-filter-chip--active' : ''}`}
              onClick={() => onFilterVrScene(!filterVrScene)}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              VR Scene
            </button>
          )}
        </div>
      )}
    </div>
  )
}
