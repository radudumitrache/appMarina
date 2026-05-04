import '../../css/student/progress/ActivityFeed.css'

export default function ActivityFeed({ items }) {
  return (
    <section className="progress-section progress-section--wide">
      <div className="section-head">
        <span className="section-title">Recent Activity</span>
      </div>

      <div className="activity-list">
        {items.map((item, i) => (
          <div
            className="activity-row"
            key={item.id}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <div className={`activity-icon activity-icon--${item.type}`}>
              {item.type === 'lesson' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              )}
            </div>
            <div className="activity-body">
              <span className="activity-text">{item.text}</span>
              <span className="activity-sub">{item.sub}</span>
            </div>
            <span className="activity-date">{item.date}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
