import '../../css/student/profile/ProfileCard.css'

export default function ProfileCard({ profile, onLogout }) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`

  return (
    <aside className="profile-aside">
      <div className="profile-card" style={{ animationDelay: '0s' }}>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-id-block">
          <span className="profile-full-name">{profile.firstName} {profile.lastName}</span>
          <span className="profile-student-id">{profile.studentId}</span>
          <span className="profile-role-badge">Student</span>
        </div>
        <div className="profile-meta-list">
          <div className="profile-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>{profile.institution}</span>
          </div>
          <div className="profile-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
            </svg>
            <span>{profile.phone}</span>
          </div>
          <div className="profile-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{profile.timezone}</span>
          </div>
        </div>

        <div className="profile-card-divider" />

        <button className="logout-btn" onClick={onLogout}>
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
