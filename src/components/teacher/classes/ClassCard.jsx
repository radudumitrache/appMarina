import '../../css/teacher/classes/ClassCard.css'

const STATUS_LABELS = {
  active:   'Active',
  complete: 'Complete',
  archived: 'Archived',
}

export default function ClassCard({ cls, index, onView, onManage }) {
  const pct = cls.lessonsTotal > 0
    ? Math.round((cls.lessonsDone / cls.lessonsTotal) * 100)
    : 0

  return (
    <article
      className={`class-card class-card--${cls.status}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      <div className="class-card-top">
        <span className="class-code">{cls.code}</span>
        <span className={`class-status class-status--${cls.status}`}>
          {STATUS_LABELS[cls.status]}
        </span>
      </div>

      <div className="class-card-body">
        <h3 className="class-name">{cls.name}</h3>
        <span className="class-subject">{cls.subject}</span>
      </div>

      <div className="class-card-divider" />

      <div className="class-card-meta">
        <div className="class-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className="class-meta-value">{cls.students}</span>
          <span className="class-meta-label">students</span>
        </div>
        <div className="class-meta-item">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span className="class-meta-value">{cls.lessonsDone}/{cls.lessonsTotal}</span>
          <span className="class-meta-label">lessons</span>
        </div>
      </div>

      <div className="class-progress-wrap">
        <div className="class-progress-bar">
          <div className="class-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="class-progress-pct">{pct}%</span>
      </div>

      <div className="class-card-actions">
        <button className="class-btn-view" onClick={() => onView?.(cls)}>
          View Class
        </button>
        <button className="class-btn-manage" onClick={() => onManage?.(cls)} title="Manage">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
    </article>
  )
}
