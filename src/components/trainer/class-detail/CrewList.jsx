import { useNavigate } from 'react-router-dom'
import '../../css/trainer/class-detail/CrewList.css'

export default function CrewList({ crew }) {
  const navigate = useNavigate()
  return (
    <div className="cd-list">
      <div className="cd-list-header">
        <span className="cd-col cd-col--crew">Crew Member</span>
        <span className="cd-col cd-col--progress">Progress</span>
        <span className="cd-col cd-col--last">Last Active</span>
        <span className="cd-col cd-col--status">Status</span>
        <span className="cd-col cd-col--action" />
      </div>

      {crew.length === 0 ? (
        <p className="cd-empty">No crew members match your search.</p>
      ) : (
        crew.map((s, i) => {
          const total = s.courseLessonsTotal || 0
          const done  = s.courseLessonsDone  || 0
          const pct   = total > 0 ? Math.round((done / total) * 100) : 0
          return (
            <div
              key={s.id}
              className="cd-row cd-row--crew cd-row--clickable"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              onClick={() => navigate(`/trainer/crew/${s.id}/progress`)}
            >
              <div className="cd-col cd-col--crew cd-crew-cell">
                <div className="cd-avatar">{s.initials}</div>
                <div className="cd-crew-info">
                  <span className="cd-crew-name">{s.name}</span>
                  <span className="cd-crew-email">{s.email}</span>
                </div>
              </div>
              <div className="cd-col cd-col--progress cd-progress-cell">
                <span className="cd-pct">{pct}%</span>
                <div className="cd-mini-bar">
                  <div className="cd-mini-fill" style={{ width: `${pct}%` }} />
                </div>
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
                <button className="cd-row-action" title="Remove crew member">
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
