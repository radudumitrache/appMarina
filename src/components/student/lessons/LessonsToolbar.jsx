import FilterPanel from './FilterPanel'

const VISIBILITY_OPTIONS = [
  { id: 'all',    label: 'All'      },
  { id: 'class',  label: 'My Class' },
  { id: 'public', label: 'Public'   },
]

export default function LessonsToolbar({
  searchQuery, onSearchChange,
  visibilityFilter, onVisFilter,
  filterOpen, onFilterToggle,
  filters, authors, onFiltersChange, onFiltersClear,
  filterWrapRef,
  activeFilters,
}) {
  return (
    <div className="lessons-toolbar">
      <div className="search-wrap">
        <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search chapters…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => onSearchChange('')} title="Clear">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6"  x2="6"  y2="18"/>
              <line x1="6"  y1="6"  x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      <div className="vis-filter">
        {VISIBILITY_OPTIONS.map(v => (
          <button
            key={v.id}
            className={`vis-btn ${visibilityFilter === v.id ? 'vis-btn--active' : ''}`}
            onClick={() => onVisFilter(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="filter-wrap" ref={filterWrapRef}>
        <button
          className={`filter-btn ${filterOpen ? 'filter-btn--open' : ''} ${activeFilters > 0 ? 'filter-btn--active' : ''}`}
          onClick={onFilterToggle}
          title="Filters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="21" y1="4"  x2="14" y2="4"/>
            <line x1="10" y1="4"  x2="3"  y2="4"/>
            <circle cx="12" cy="4"  r="2"/>
            <line x1="21" y1="12" x2="12" y2="12"/>
            <line x1="8"  y1="12" x2="3"  y2="12"/>
            <circle cx="10" cy="12" r="2"/>
            <line x1="21" y1="20" x2="16" y2="20"/>
            <line x1="12" y1="20" x2="3"  y2="20"/>
            <circle cx="14" cy="20" r="2"/>
          </svg>
          <span>Filters</span>
          {activeFilters > 0 && (
            <span className="filter-count">{activeFilters}</span>
          )}
        </button>

        {filterOpen && (
          <FilterPanel
            filters={filters}
            authors={authors}
            onChange={onFiltersChange}
            onClear={onFiltersClear}
          />
        )}
      </div>
    </div>
  )
}
