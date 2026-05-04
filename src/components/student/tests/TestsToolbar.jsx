import '../../css/student/tests/TestsToolbar.css'

const SOURCE_OPTIONS = [
  { id: 'all',   label: 'All'        },
  { id: 'class', label: 'My Classes' },
  { id: 'open',  label: 'Open Access'},
]

export default function TestsToolbar({ searchQuery, onSearchChange, sourceFilter, onSourceFilter }) {
  return (
    <div className="tests-toolbar">
      <div className="tests-search-wrap">
        <svg className="tests-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="tests-search-input"
          type="text"
          placeholder="Search tests…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="tests-search-clear" onClick={() => onSearchChange('')} title="Clear">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="tests-source-filter">
        {SOURCE_OPTIONS.map(v => (
          <button
            key={v.id}
            className={`tests-source-btn ${sourceFilter === v.id ? 'tests-source-btn--active' : ''}`}
            onClick={() => onSourceFilter(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
