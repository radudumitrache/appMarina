import '../../css/crew/profile/AcademicTab.css'

export default function AcademicTab({ profile, stats }) {
  return (
    <div className="profile-panel">
      <div className="panel-head">
        <span className="panel-title">Academic Information</span>
      </div>

      <div className="form-grid">
        <div className="form-field form-field--wide">
          <label className="form-label">Institution</label>
          <span className="form-value">{profile.institution}</span>
        </div>
        <div className="form-field form-field--wide">
          <label className="form-label">Programme</label>
          <span className="form-value">{profile.program}</span>
        </div>
        <div className="form-field">
          <label className="form-label">Registration ID</label>
          <span className="form-value form-value--mono">{profile.registrationId}</span>
        </div>
        <div className="form-field">
          <label className="form-label">Start Year</label>
          <span className="form-value form-value--mono">{profile.startYear}</span>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="academic-snapshot">
        <div className="snapshot-item">
          <span className="snapshot-value">{stats?.modules_complete ?? 'â€”'}</span>
          <span className="snapshot-label">Lessons complete</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">
            {stats?.avg_grade != null ? <>{stats.avg_grade}<span className="snapshot-suffix">%</span></> : 'â€”'}
          </span>
          <span className="snapshot-label">Avg test grade</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">{stats?.tests_taken ?? 'â€”'}</span>
          <span className="snapshot-label">Tests taken</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">
            {stats?.hours_trained != null ? <>{stats.hours_trained}<span className="snapshot-suffix">h</span></> : 'â€”'}
          </span>
          <span className="snapshot-label">Hours trained</span>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="panel-note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        To update institution or programme, contact your programme coordinator or submit a support ticket.
      </div>
    </div>
  )
}
