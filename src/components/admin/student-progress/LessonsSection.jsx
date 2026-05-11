import { fmt } from './helpers'

export default function LessonsSection({ lessons }) {
  return (
    <div className="sp-section">
      <div className="sp-section-head">
        <span className="sp-section-title">Completed Lessons</span>
        <span className="sp-section-count">{lessons.length}</span>
      </div>

      {lessons.length === 0 ? (
        <p className="sp-empty">No lessons completed yet.</p>
      ) : (
        <div className="sp-list">
          {lessons.map((l, i) => (
            <div
              key={l.id}
              className="sp-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="sp-lesson-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              </div>

              <div className="sp-row-body">
                <span className="sp-row-title">{l.lesson_title}</span>
                <span className="sp-row-meta">Completed {fmt(l.completed_at)}</span>
              </div>

              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
