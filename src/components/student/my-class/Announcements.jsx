import '../../css/student/my-class/Announcements.css'

function formatAnnDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Announcements({ items }) {
  return (
    <section className="myclass-section">
      <div className="section-head">
        <span className="section-title">Announcements</span>
      </div>
      <div className="announcements-list">
        {items.map((ann, i) => (
          <div
            key={ann.id}
            className={`announcement-row ${ann.pinned ? 'announcement-row--pinned' : ''}`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <div className="announcement-head">
              <span className="announcement-title">{ann.title}</span>
              {ann.pinned && (
                <span className="announcement-pin">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="17" x2="12" y2="22"/>
                    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
                  </svg>
                  Pinned
                </span>
              )}
            </div>
            <p className="announcement-body">{ann.body}</p>
            <div className="announcement-footer">
              <span className="announcement-author">{ann.author}</span>
              <span className="announcement-date">{formatAnnDate(ann.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
