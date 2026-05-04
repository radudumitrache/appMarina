import '../../css/admin/lessons/LessonsToolbar.css'

export default function LessonsToolbar({ title, filteredCount, search, onSearchChange, statusFilter, onStatusFilterChange, onCreateNew }) {
  return (
    <>
      <div className="lessons-adm-head">
        <h2 className="lessons-adm-title">{title}</h2>
        <span className="lessons-adm-count">{filteredCount} lessons</span>
        <div className="lessons-adm-actions">
          <button className="btn-primary" onClick={onCreateNew}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Lesson
          </button>
        </div>
      </div>

      <div className="lessons-adm-toolbar">
        <div className="search-wrap">
          <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search lessons…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
        <div className="status-filter">
          {[
            { id: 'all',       label: 'All'       },
            { id: 'published', label: 'Published' },
            { id: 'draft',     label: 'Draft'     },
          ].map(s => (
            <button
              key={s.id}
              className={`status-filter-btn ${statusFilter === s.id ? 'status-filter-btn--active' : ''}`}
              onClick={() => onStatusFilterChange(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
