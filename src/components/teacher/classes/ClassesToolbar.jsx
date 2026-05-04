import '../../css/teacher/classes/ClassesToolbar.css'

const TABS = [
  { id: 'all',      label: 'All'      },
  { id: 'active',   label: 'Active'   },
  { id: 'complete', label: 'Complete' },
  { id: 'archived', label: 'Archived' },
]

export default function ClassesToolbar({ classes, tab, onTabChange, search, onSearchChange }) {
  return (
    <div className="classes-toolbar">
      <div className="classes-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? 'tab-btn--active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
            {t.id !== 'all' && (
              <span className="tab-count">
                {classes.filter(c => c.status === t.id).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="classes-search-wrap">
        <svg className="classes-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="classes-search-input"
          type="text"
          placeholder="Search classes…"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        {search && (
          <button className="classes-search-clear" onClick={() => onSearchChange('')} title="Clear">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
