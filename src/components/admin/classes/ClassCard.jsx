import '../../css/admin/classes/ClassCard.css'

export default function ClassCard({
  cls,
  allStudents,
  allLessons,
  isStudentsExpanded,
  isLessonsExpanded,
  onToggleStudents,
  onToggleLessons,
  onManage,
  onEdit,
  onToggleArchive,
  onDelete,
  index,
}) {
  return (
    <div
      className={`class-card ${cls.status === 'archived' ? 'class-card--archived' : ''}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <div className="class-card-header">
        <div className="class-card-name-row">
          <h3 className="class-card-name">{cls.name}</h3>
          <span className={`class-status-badge class-status-badge--${cls.status}`}>
            {cls.status}
          </span>
        </div>
        {cls.description && <p className="class-card-desc">{cls.description}</p>}
      </div>

      <div className="class-card-teacher">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span className="class-teacher-name">{cls.teacher}</span>
      </div>

      <div className="class-card-counts">
        <button className="class-count-btn" onClick={onToggleStudents}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="class-count-num">{cls.students.length}</span>
          <span className="class-count-label">students</span>
        </button>
        <span className="class-count-sep">·</span>
        <button className="class-count-btn" onClick={onToggleLessons}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span className="class-count-num">{cls.lessons.length}</span>
          <span className="class-count-label">lessons</span>
        </button>
      </div>

      {isStudentsExpanded && (
        <div className="class-expand">
          <p className="class-expand-label">Students</p>
          <div className="class-expand-list">
            {cls.students.length === 0
              ? <span className="class-expand-empty">No students assigned</span>
              : cls.students.map(sid => {
                  const s = allStudents.find(x => x.id === sid)
                  return s ? <span key={sid} className="class-expand-chip">{s.name}</span> : null
                })
            }
          </div>
        </div>
      )}

      {isLessonsExpanded && (
        <div className="class-expand">
          <p className="class-expand-label">Lessons</p>
          <div className="class-expand-list">
            {cls.lessons.length === 0
              ? <span className="class-expand-empty">No lessons assigned</span>
              : cls.lessons.map(lid => {
                  const l = allLessons.find(x => x.id === lid)
                  return l ? <span key={lid} className="class-expand-chip">{l.title}</span> : null
                })
            }
          </div>
        </div>
      )}

      <div className="class-card-actions">
        <button className="class-action-btn class-action-btn--manage" onClick={onManage}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Manage
        </button>
        <button className="class-action-btn" onClick={onEdit}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
        <button className="class-action-btn" onClick={onToggleArchive}>
          {cls.status === 'active' ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              Archive
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
              </svg>
              Restore
            </>
          )}
        </button>
        <button className="class-action-btn class-action-btn--delete" onClick={onDelete}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}
