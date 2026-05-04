import '../../css/student/profile/AcademicTab.css'

export default function AcademicTab({ profile }) {
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
          <label className="form-label">Student ID</label>
          <span className="form-value form-value--mono">{profile.studentId}</span>
        </div>
        <div className="form-field">
          <label className="form-label">Start Year</label>
          <span className="form-value form-value--mono">{profile.startYear}</span>
        </div>
      </div>

      <div className="panel-divider" />

      <div className="academic-snapshot">
        <div className="snapshot-item">
          <span className="snapshot-value">5</span>
          <span className="snapshot-label">Lessons complete</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">72<span className="snapshot-suffix">%</span></span>
          <span className="snapshot-label">Avg test grade</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">5</span>
          <span className="snapshot-label">Tests taken</span>
        </div>
        <div className="snapshot-sep" />
        <div className="snapshot-item">
          <span className="snapshot-value">7<span className="snapshot-suffix">th</span></span>
          <span className="snapshot-label">Class rank</span>
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
