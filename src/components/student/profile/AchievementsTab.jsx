import { useState } from 'react'
import '../../css/student/profile/AchievementsTab.css'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function AchievementIcon({ icon, size = 16 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (icon === 'book')  return <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  if (icon === 'star')  return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  if (icon === 'flame') return <svg {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 0 1-7 7 7 7 0 0 1-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
  if (icon === 'award') return <svg {...props}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
  if (icon === 'crown') return <svg {...props}><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M5 20h14"/></svg>
  return null
}

export default function AchievementsTab({ achievements }) {
  const [view, setView] = useState('grid')

  const earned  = achievements.filter(a => a.earned)
  const locked  = achievements.filter(a => !a.earned)

  return (
    <div className="profile-panel">
      <div className="panel-head">
        <span className="panel-title">Achievements</span>
        <span className="ach-count">{earned.length} / {achievements.length} earned</span>
        <div className="ach-view-toggle">
          <button
            className={`ach-view-btn ${view === 'grid' ? 'ach-view-btn--active' : ''}`}
            onClick={() => setView('grid')}
            title="Grid view"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            className={`ach-view-btn ${view === 'list' ? 'ach-view-btn--active' : ''}`}
            onClick={() => setView('list')}
            title="List view"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {achievements.length === 0 ? (
        <p className="ach-empty">No achievements yet. Keep learning to unlock them.</p>
      ) : view === 'grid' ? (
        <div className="ach-grid">
          {[...earned, ...locked].map((a, i) => (
            <div
              key={a.id}
              className={`ach-card ${a.earned ? 'ach-card--earned' : 'ach-card--locked'}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="ach-card-icon">
                <AchievementIcon icon={a.icon} size={20} />
              </div>
              <span className="ach-card-label">{a.label}</span>
              {a.earned && a.date && (
                <span className="ach-card-date">{formatDate(a.date)}</span>
              )}
              {!a.earned && (
                <span className="ach-card-locked">Not yet earned</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="ach-list">
          {[...earned, ...locked].map((a, i) => (
            <div
              key={a.id}
              className={`ach-row ${a.earned ? 'ach-row--earned' : 'ach-row--locked'}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="ach-row-icon">
                <AchievementIcon icon={a.icon} size={14} />
              </div>
              <span className="ach-row-label">{a.label}</span>
              <span className="ach-row-date">
                {a.earned ? (a.date ? formatDate(a.date) : 'Earned') : 'Not yet earned'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
