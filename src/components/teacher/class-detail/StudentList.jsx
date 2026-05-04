import '../../css/teacher/class-detail/StudentList.css'

export default function StudentList({ students, lessonsTotal }) {
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--student">Student</span>
        <span className="cd-col cd-col--progress">Progress</span>
        <span className="cd-col cd-col--lessons">Lessons</span>
        <span className="cd-col cd-col--last">Last Active</span>
        <span className="cd-col cd-col--status">Status</span>
        <span className="cd-col cd-col--action" />
      </div>

      {students.length === 0 ? (
        <p className="cd-empty">No students match your search.</p>
      ) : (
        students.map((s, i) => {
          const pct = Math.round((s.done / lessonsTotal) * 100)
          return (
            <div
              key={s.id}
              className="cd-row cd-row--student"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="cd-col cd-col--student cd-student-cell">
                <div className="cd-avatar">{s.initials}</div>
                <div className="cd-student-info">
                  <span className="cd-student-name">{s.name}</span>
                  <span className="cd-student-email">{s.email}</span>
                </div>
              </div>
              <div className="cd-col cd-col--progress cd-progress-cell">
                <div className="cd-mini-bar">
                  <div className="cd-mini-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="cd-pct">{pct}%</span>
              </div>
              <div className="cd-col cd-col--lessons">
                <span className="cd-mono">{s.done}/{lessonsTotal}</span>
              </div>
              <div className="cd-col cd-col--last">
                <span className="cd-mono cd-muted">{s.lastActive}</span>
              </div>
              <div className="cd-col cd-col--status">
                <span className={`cd-badge cd-badge--${s.status}`}>
                  {s.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="cd-col cd-col--action">
                <button className="cd-row-action" title="Remove student">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
