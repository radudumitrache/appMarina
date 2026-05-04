import '../../css/teacher/class-detail/StudentList.css'

export default function LessonList({ lessons }) {
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--num">#</span>
        <span className="cd-col cd-col--lesson">Lesson</span>
        <span className="cd-col cd-col--cat">Category</span>
        <span className="cd-col cd-col--dur">Duration</span>
        <span className="cd-col cd-col--completion">Completion</span>
        <span className="cd-col cd-col--action" />
      </div>

      {lessons.length === 0 ? (
        <p className="cd-empty">No lessons match your search.</p>
      ) : (
        lessons.map((l, i) => {
          const pct = Math.round((l.completed / l.total) * 100)
          const isDone = l.completed === l.total
          return (
            <div
              key={l.id}
              className="cd-row cd-row--lesson"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="cd-col cd-col--num">
                <span className="cd-lesson-num">{l.num}</span>
              </div>
              <div className="cd-col cd-col--lesson">
                <span className="cd-lesson-title">{l.title}</span>
              </div>
              <div className="cd-col cd-col--cat">
                <span className="cd-cat-tag">{l.cat}</span>
              </div>
              <div className="cd-col cd-col--dur">
                <span className="cd-mono cd-muted">{l.duration}</span>
              </div>
              <div className="cd-col cd-col--completion cd-completion-cell">
                <div className="cd-mini-bar">
                  <div
                    className={`cd-mini-fill ${isDone ? 'cd-mini-fill--done' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="cd-mono cd-completion-count">{l.completed}/{l.total}</span>
              </div>
              <div className="cd-col cd-col--action">
                <button className="cd-row-action" title="Remove lesson">
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
