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

function StudentAvatar({ name }) {
  return <div className="cd-member-avatar">{name.charAt(0)}</div>
}

function LessonIcon() {
  return (
    <div className="cd-lesson-icon">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    </div>
  )
}

export default function ManagementPanel({
  title,
  type,
  items,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  suggestions,
  isFocused,
  onFocus,
  onBlur,
  onAdd,
  onRemove,
}) {
  return (
    <div className="cd-panel">
      <div className="cd-panel-header">
        <span className="cd-panel-title">{title}</span>
        <span className="cd-panel-count">{items.length}</span>
      </div>

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
                {type === 'student' ? item.name : item.title}
              </button>
            ))}
          </div>
        )}
        {isFocused && searchValue.trim() && suggestions.length === 0 && (
          <div className="cd-dropdown">
            <span className="cd-dropdown-empty">
              No matching {type === 'student' ? 'students' : 'lessons'} available
            </span>
          </div>
        )}
      </div>

      <div className="cd-member-list">
        {items.length === 0 ? (
          <p className="cd-empty-hint">
            No {type === 'student' ? 'students enrolled' : 'lessons assigned'} yet.
          </p>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className={`cd-member-row${type === 'lesson' ? ' cd-member-row--lesson' : ''}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              {type === 'student'
                ? <StudentAvatar name={item.name} />
                : <LessonIcon />
              }
              <span className="cd-member-name">
                {type === 'student' ? item.name : item.title}
              </span>
              <button
                className="cd-remove-btn"
                title={type === 'student' ? 'Remove student' : 'Unassign lesson'}
                onClick={() => onRemove(item.id)}
              >
                <XIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
