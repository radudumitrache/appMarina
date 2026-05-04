import '../../css/admin/class-detail/ClassDetailHeader.css'

export default function ClassDetailHeader({ cls }) {
  return (
    <div className="cd-header">
      <div className="cd-header-left">
        <div className="cd-name-row">
          <h1 className="cd-name">{cls.name}</h1>
          <span className={`cd-status-badge cd-status-badge--${cls.status}`}>{cls.status}</span>
        </div>
        {cls.description && <p className="cd-description">{cls.description}</p>}
        <div className="cd-teacher-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="cd-teacher-name">{cls.teacher}</span>
        </div>
      </div>
      <div className="cd-header-stats">
        <div className="cd-stat">
          <span className="cd-stat-value">{cls.students.length}</span>
          <span className="cd-stat-label">Students</span>
        </div>
        <div className="cd-stat-sep" />
        <div className="cd-stat">
          <span className="cd-stat-value">{cls.lessons.length}</span>
          <span className="cd-stat-label">Lessons</span>
        </div>
      </div>
    </div>
  )
}
