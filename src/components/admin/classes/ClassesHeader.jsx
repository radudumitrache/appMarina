import '../../../css/admin/classes/ClassesHeader.css'

export default function ClassesHeader({ filteredCount, search, onSearchChange, statusFilter, onStatusFilterChange, onCreateNew }) {
  return (
    <div className="classes-adm-header">
      <div className="classes-adm-header-left">
        <h1 className="classes-adm-title">Classes</h1>
        <span className="classes-adm-count">{filteredCount} classes</span>
      </div>
      <div className="classes-adm-header-right">
        <div className="search-wrap-inline">
          <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input-inline"
            type="text"
            placeholder="Search classes or teachers…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className="classes-status-filter">
          {[
            { id: 'all',      label: 'All'      },
            { id: 'active',   label: 'Active'   },
            { id: 'archived', label: 'Archived' },
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
        <button className="btn-primary" onClick={onCreateNew}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Class
        </button>
      </div>
    </div>
  )
}
