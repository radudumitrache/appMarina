import '../../css/admin/class-detail/ManagementPanel.css'

function XIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function CrewAvatar({ name }) {
  return <div className="cd-member-avatar">{name.charAt(0)}</div>
}

function ModuleIcon() {
  return (
    <div className="cd-module-icon">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    </div>
  )
}

function CourseIcon() {
  return (
    <div className="cd-module-icon cd-module-icon--course">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    </div>
  )
}

function TestIcon() {
  return (
    <div className="cd-module-icon cd-module-icon--test">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    </div>
  )
}

export default function ManagementPanel({
  title,
  type,
  items,
  readOnly = false,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  suggestions,
  isFocused,
  onFocus,
  onBlur,
  onAdd,
  onRemove,
  onSelectItem,
}) {
  const emptyLabel = type === 'crew' ? 'crew members enrolled'
    : type === 'test'   ? 'tests assigned'
    : type === 'course' ? 'courses assigned'
    : 'modules assigned'

  const noMatchLabel = type === 'crew' ? 'crew members'
    : type === 'test'   ? 'tests'
    : type === 'course' ? 'courses'
    : 'modules'

  const removeTitle = type === 'crew' ? 'Remove crew member'
    : type === 'test'   ? 'Unassign test'
    : type === 'course' ? 'Unassign course'
    : 'Unassign module'

  return (
    <div className="cd-panel">
      <div className="cd-panel-header">
        <span className="cd-panel-title">{title}</span>
        <span className="cd-panel-count">{items.length}</span>
      </div>

      {!readOnly && (
        <div className="cd-adder">
          <div className="cd-adder-wrap">
            <svg className="cd-adder-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="cd-adder-input"
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
          {isFocused && suggestions.length > 0 && (
            <div className="cd-dropdown">
              {suggestions.map(item => (
                <button
                  key={item.id}
                  className="cd-dropdown-item"
                  onMouseDown={() => onAdd(item)}
                >
                  <PlusIcon />
                  {type === 'crew' ? item.name : item.title}
                </button>
              ))}
            </div>
          )}
          {isFocused && searchValue.trim() && suggestions.length === 0 && (
            <div className="cd-dropdown">
              <span className="cd-dropdown-empty">
                No matching {noMatchLabel} available
              </span>
            </div>
          )}
        </div>
      )}

      <div className="cd-member-list">
        {items.length === 0 ? (
          <p className="cd-empty-hint">No {emptyLabel} yet.</p>
        ) : (
          items.map((item, i) => {
            const clickable = (type === 'crew' || type === 'course') && onSelectItem
            return (
              <div
                key={item.id}
                className={`cd-member-row${(type === 'module' || type === 'course') ? ' cd-member-row--module' : ''}${clickable ? ' cd-member-row--clickable' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                onClick={clickable ? () => onSelectItem(item) : undefined}
              >
                {type === 'crew'
                  ? <CrewAvatar name={item.name} />
                  : type === 'test'
                    ? <TestIcon />
                    : type === 'course'
                      ? <CourseIcon />
                      : <ModuleIcon />
                }
                <span className="cd-member-name">
                  {type === 'crew' ? item.name : item.title}
                </span>
                {clickable && (
                  <svg className="cd-member-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                )}
                {onRemove && (
                  <button
                    className="cd-remove-btn"
                    title={removeTitle}
                    onClick={e => { e.stopPropagation(); onRemove(item.id) }}
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
