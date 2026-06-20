import '../../css/trainer/tests/TestsToolbar.css'

const STATUS_OPTIONS = [
  { id: 'all',       label: 'All'       },
  { id: 'published', label: 'Published' },
  { id: 'draft',     label: 'Draft'     },
]

export default function TestsToolbar({ searchQuery, onSearchChange, statusFilter, onStatusFilter }) {
  return (
    <div className="ttests-toolbar">
      <div className="ttests-search-wrap">
        <svg className="ttests-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="ttests-search-input"
          type="text"
          placeholder="Search tests…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="ttests-search-clear" onClick={() => onSearchChange('')} title="Clear">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="ttests-status-filter">
        {STATUS_OPTIONS.map(v => (
          <button
            key={v.id}
            className={`ttests-status-btn ${statusFilter === v.id ? 'ttests-status-btn--active' : ''}`}
            onClick={() => onStatusFilter(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
