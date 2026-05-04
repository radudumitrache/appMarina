import '../../css/teacher/profile/ProfileCard.css'

export default function ProfileCard({ profile, onSignOut }) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  return (
    <aside className="tp-aside">
      <div className="tp-card" style={{ animationDelay: '0s' }}>

        <div className="tp-avatar">{initials}</div>

        <div className="tp-id-block">
          <span className="tp-full-name">{profile.firstName} {profile.lastName}</span>
          <span className="tp-employee-id">{profile.employeeId}</span>
          <span className="tp-role-badge">Instructor</span>
        </div>

        <div className="tp-meta-list">
          <div className="tp-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>{profile.department}</span>
          </div>
          <div className="tp-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
            </svg>
            <span>{profile.phone}</span>
          </div>
          <div className="tp-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{profile.timezone}</span>
          </div>
        </div>

        <div className="tp-card-divider" />

        <div className="tp-summary">
          <span className="tp-summary-label">Teaching Overview</span>
          <div className="tp-summary-stats">
            <div className="tp-summary-stat">
              <span className="tp-summary-value">4</span>
              <span className="tp-summary-key">Active classes</span>
            </div>
            <div className="tp-summary-stat">
              <span className="tp-summary-value">47</span>
              <span className="tp-summary-key">Total students</span>
            </div>
            <div className="tp-summary-stat">
              <span className="tp-summary-value">3</span>
              <span className="tp-summary-key">Courses published</span>
            </div>
          </div>
        </div>

        <div className="tp-card-divider" />

        <button className="tp-logout-btn" onClick={onSignOut}>
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
