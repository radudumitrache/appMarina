import '../../css/teacher/class-detail/StudentList.css'

export default function AssignmentList({ assignments }) {
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--assignment">Assignment</span>
        <span className="cd-col cd-col--due">Due Date</span>
        <span className="cd-col cd-col--submissions">Submissions</span>
        <span className="cd-col cd-col--score">Avg. Score</span>
        <span className="cd-col cd-col--action" />
      </div>

      {assignments.map((a, i) => {
        const subPct = Math.round((a.submitted / a.total) * 100)
        return (
          <div
            key={a.id}
            className="cd-row cd-row--assignment"
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <div className="cd-col cd-col--assignment">
              <span className="cd-assignment-title">{a.title}</span>
            </div>
            <div className="cd-col cd-col--due">
              <span className="cd-mono cd-muted">{a.dueDate}</span>
            </div>
            <div className="cd-col cd-col--submissions cd-completion-cell">
              <div className="cd-mini-bar">
                <div className="cd-mini-fill" style={{ width: `${subPct}%` }} />
              </div>
              <span className="cd-mono cd-completion-count">{a.submitted}/{a.total}</span>
            </div>
            <div className="cd-col cd-col--score">
              {a.avgScore !== null
                ? <span className="cd-mono">{a.avgScore}<span className="cd-muted">%</span></span>
                : <span className="cd-mono cd-muted">—</span>
              }
            </div>
            <div className="cd-col cd-col--action">
              <button className="cd-row-action cd-row-action--view" title="View submissions">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
