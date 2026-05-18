import '../../css/admin/classes/ClassCard.css'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ClassCard({ cls, index, onManage, onEdit, onDelete }) {
  const studentCount = cls.student_count ?? 0
  const lessonCount  = cls.lesson_count  ?? 0
  const startFmt     = formatDate(cls.start_date)
  const endFmt       = formatDate(cls.end_date)
  const dateRange    = startFmt && endFmt ? `${startFmt} — ${endFmt}` : startFmt || endFmt || null

  return (
    <div
      className={`class-card ${cls.status === 'archived' ? 'class-card--archived' : ''}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <div className="class-card-top">
        <div className="class-card-name-row">
          <h3 className="class-card-name">{cls.name}</h3>
          <span className={`class-status-badge class-status-badge--${cls.status}`}>
            {cls.status}
          </span>
        </div>
        {cls.subject && <p className="class-card-subject">{cls.subject}</p>}
      </div>

      <div className="class-card-meta">
        <div className="class-card-meta-row">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="class-teacher-name">{cls.teacher_name}</span>
        </div>
        {dateRange && (
          <div className="class-card-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="class-date-range">{dateRange}</span>
          </div>
        )}
      </div>

      <div className="class-card-counts">
        <button className="class-count-btn" onClick={onManage}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="class-count-num">{studentCount}</span>
          <span className="class-count-label">students</span>
        </button>
        <div className="class-count-divider" />
        <button className="class-count-btn" onClick={onManage}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span className="class-count-num">{lessonCount}</span>
          <span className="class-count-label">lessons</span>
        </button>
      </div>

      <div className="class-card-actions">
        <button className="class-action-btn class-action-btn--view" onClick={onManage}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View
        </button>
        <button className="class-action-btn class-action-btn--edit" onClick={onEdit}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
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
