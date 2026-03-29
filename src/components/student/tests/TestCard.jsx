import '../../css/student/tests/TestCard.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDueDateStatus(dateStr) {
  if (!dateStr) return 'none'
  const now = new Date()
  const due = new Date(dateStr)
  const diff = (due - now) / (1000 * 60 * 60 * 24)
  if (diff < 0)  return 'overdue'
  if (diff <= 3) return 'soon'
  return 'ok'
}

function gradeClass(grade) {
  if (grade >= 90) return 'grade--pass'
  if (grade >= 70) return 'grade--good'
  if (grade >= 50) return 'grade--warn'
  return 'grade--fail'
}

export default function TestCard({ test, index, className: classLabel }) {
  const delay        = `${Math.min(index, 6) * 0.04}s`
  const dueDateStatus = getDueDateStatus(test.dueDate)
  const formattedDate = formatDate(test.dueDate)
  const num           = String(test.id).padStart(2, '0')

  if (test.completed) {
    return (
      <div
        className="test-card test-card--completed"
        style={{ animationDelay: delay }}
      >
        <div className="test-card-num">{num}</div>

        <div className="test-card-body">
          <h3 className="test-card-title">{test.title}</h3>
          <div className="test-card-meta">
            <span className="test-meta-author">By {test.author}</span>
            {classLabel && (
              <>
                <span className="test-meta-sep">·</span>
                <span className="test-meta-class">{classLabel}</span>
              </>
            )}
          </div>
        </div>

        <div className="test-card-grade-wrap">
          <div className={`test-card-grade ${gradeClass(test.grade)}`}>
            <span className="grade-value">{test.grade}</span>
            <span className="grade-pct">%</span>
          </div>
          <span className="test-grade-label">Completed</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="test-card test-card--pending"
      style={{ animationDelay: delay }}
    >
      <div className="test-card-num">{num}</div>

      <div className="test-card-body">
        <h3 className="test-card-title">{test.title}</h3>
        <div className="test-card-meta">
          <span className="test-meta-author">By {test.author}</span>
          {classLabel && (
            <>
              <span className="test-meta-sep">·</span>
              <span className="test-meta-class">{classLabel}</span>
            </>
          )}
        </div>

        {formattedDate && (
          <div className={`test-card-due test-card-due--${dueDateStatus}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
            </svg>
            <span>
              {dueDateStatus === 'overdue' ? 'Overdue · '  :
               dueDateStatus === 'soon'    ? 'Due soon · ' :
               'Due '}
              {formattedDate}
            </span>
          </div>
        )}
      </div>

      <div className="test-card-action">
        <button className="test-start-btn" aria-label="Start test">
          Start
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5"  y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
