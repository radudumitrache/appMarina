import { SORT_OPTIONS } from '../../../pages/teacher/progressMock'
import '../../css/teacher/progress/ProgressToolbar.css'

const STATUS_FILTERS = [
  { id: 'all',      label: 'All'      },
  { id: 'at-risk',  label: 'At Risk'  },
  { id: 'on-track', label: 'On Track' },
  { id: 'complete', label: 'Complete' },
]

export default function ProgressToolbar({
  students, classFilter,
  statusFilter, onStatusChange,
  search, onSearchChange,
  sortBy, onSortChange,
}) {
  return (
    <div className="tp-toolbar">
      <div className="tp-status-filter">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.id}
            className={`tp-filter-btn ${statusFilter === f.id ? 'tp-filter-btn--active' : ''} ${f.id !== 'all' ? `tp-filter-btn--${f.id}` : ''}`}
            onClick={() => onStatusChange(f.id)}
          >
            {f.label}
            {f.id !== 'all' && (
              <span className="tp-filter-count">
                {students.filter(s => s.status === f.id && (classFilter === 'all' || s.classId === classFilter)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="tp-toolbar-right">
        <div className="tp-search-wrap">
          <svg className="tp-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="tp-search"
            type="text"
            placeholder="Search students…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          {search && (
            <button className="tp-search-clear" onClick={() => onSearchChange('')}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6"  x2="6"  y2="18"/>
                <line x1="6"  y1="6"  x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        <div className="tp-sort-wrap">
          <span className="tp-sort-label">Sort by</span>
          <select className="tp-sort-select" value={sortBy} onChange={e => onSortChange(e.target.value)}>
            {SORT_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
