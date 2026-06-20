import '../../css/trainer/classes/ClassCard.css'

const STATUS_LABELS = {
  active:   'Active',
  complete: 'Complete',
  archived: 'Archived',
}

export default function ClassCard({ cls, index, onView, onDelete }) {
  return (
    <article
      className={`class-card class-card--${cls.status}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <div className="class-card-top">
        <h3 className="class-name">{cls.name}</h3>
        <span className={`class-status class-status--${cls.status}`}>
          {STATUS_LABELS[cls.status]}
        </span>
      </div>

      <div className="class-card-meta">
        <div className="class-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="class-meta-value">{cls.students ?? 0}</span>
          <span className="class-meta-label">students</span>
        </div>
        <span className="class-meta-sep">&middot;</span>
        <div className="class-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span className="class-meta-value">{cls.coursesTotal ?? 0}</span>
          <span className="class-meta-label">courses</span>
        </div>
      </div>

      <div className="class-card-actions">
        <button className="class-btn-view" onClick={() => onView?.(cls)}>
          View Department
        </button>
        <button className="class-btn-delete" onClick={() => onDelete?.(cls)} title="Delete department">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </article>
  )
}
