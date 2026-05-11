import '../../css/teacher/class-detail/StudentList.css'

const STATUS_MAP = {
  draft:     { label: 'Draft',     cls: 'cd-badge--draft'     },
  published: { label: 'Published', cls: 'cd-badge--published' },
}

export default function TestList({ tests }) {
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--test-title">Test</span>
        <span className="cd-col cd-col--test-status">Status</span>
        <span className="cd-col cd-col--test-due">Due Date</span>
        <span className="cd-col cd-col--test-time">Time Limit</span>
        <span className="cd-col cd-col--test-q">Questions</span>
        <span className="cd-col cd-col--action" />
      </div>

      {tests.length === 0 ? (
        <p className="cd-empty">No tests yet. Click "New Test" to create one.</p>
      ) : (
        tests.map((t, i) => {
          const sm = STATUS_MAP[t.status] ?? STATUS_MAP.draft
          return (
            <div
              key={t.id}
              className="cd-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="cd-col cd-col--test-title">
                <span className="cd-lesson-title">{t.title}</span>
              </div>
              <div className="cd-col cd-col--test-status">
                <span className={`cd-badge ${sm.cls}`}>{sm.label}</span>
              </div>
              <div className="cd-col cd-col--test-due">
                <span className="cd-mono cd-muted">{t.due_date ?? '—'}</span>
              </div>
              <div className="cd-col cd-col--test-time">
                <span className="cd-mono cd-muted">{t.time_limit_minutes} min</span>
              </div>
              <div className="cd-col cd-col--test-q">
                <span className="cd-mono cd-muted">{t.question_count ?? 0}</span>
              </div>
              <div className="cd-col cd-col--action">
                <button className="cd-row-action cd-row-action--view" title="View test">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
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
