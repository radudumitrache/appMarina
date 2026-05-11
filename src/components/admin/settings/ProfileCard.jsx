import '../../css/admin/settings/ProfileCard.css'

export default function ProfileCard({ profile, stats, onSignOut }) {
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <aside className="as-aside">
      <div className="as-card">

        <div className="as-avatar">{initials}</div>

        <div className="as-id-block">
          <span className="as-full-name">
            {(profile.firstName || profile.lastName)
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : profile.username}
          </span>
          <span className="as-username">@{profile.username}</span>
          <span className="as-role-badge">Administrator</span>
        </div>

        <div className="as-meta-list">
          <div className="as-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>{profile.email || '—'}</span>
          </div>
          <div className="as-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16z"/>
            </svg>
            <span>{profile.phone || '—'}</span>
          </div>
          <div className="as-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{profile.timezone}</span>
          </div>
        </div>

        <div className="as-card-divider" />

        <div className="as-summary">
          <span className="as-summary-label">Platform Overview</span>
          <div className="as-summary-stats">
            <div className="as-summary-stat">
              <span className="as-summary-value">{stats?.total_users ?? '—'}</span>
              <span className="as-summary-key">Total users</span>
            </div>
            <div className="as-summary-stat">
              <span className="as-summary-value">{stats?.total_classes ?? '—'}</span>
              <span className="as-summary-key">Classes</span>
            </div>
            <div className="as-summary-stat">
              <span className="as-summary-value">{stats?.active_students_last_7_days ?? '—'}</span>
              <span className="as-summary-key">Active this week</span>
            </div>
          </div>
        </div>

        <div className="as-card-divider" />

        <button className="as-logout-btn" onClick={onSignOut}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>

      </div>
    </aside>
  )
}
