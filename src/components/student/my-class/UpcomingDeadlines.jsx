import '../../css/student/my-class/UpcomingDeadlines.css'

function daysUntil(iso) {
  return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
}

function formatDue(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function UpcomingDeadlines({ items }) {
  return (
    <section className="myclass-section">
      <div className="section-head">
        <span className="section-title">Upcoming Deadlines</span>
      </div>
      <div className="deadlines-list">
        {items.map((item, i) => {
          const days   = daysUntil(item.due)
          const overdue = days < 0
          const soon    = days >= 0 && days <= 3
          return (
            <div
              key={item.id}
              className="deadline-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className={`deadline-type-icon deadline-type-icon--${item.type}`}>
                {item.type === 'test' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                )}
              </div>
              <div className="deadline-body">
                <span className="deadline-title">{item.title}</span>
                <span className={`deadline-due ${overdue ? 'deadline-due--overdue' : soon ? 'deadline-due--soon' : ''}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  {overdue
                    ? `Overdue · ${formatDue(item.due)}`
                    : soon
                    ? `Due soon · ${formatDue(item.due)}`
                    : `Due ${formatDue(item.due)}`}
                </span>
              </div>
              <span className="deadline-type-tag">
                {item.type === 'test' ? 'Test' : 'Lesson'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
