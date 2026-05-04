import '../../css/teacher/profile/TeachingPanel.css'

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function TeachingPanel({ profile }) {
  return (
    <div className="tp-panel">
      <div className="tp-panel-head">
        <span className="tp-panel-title">Teaching Information</span>
      </div>

      <div className="tp-form-grid">
        <div className="tp-form-field tp-form-field--wide">
          <label className="tp-form-label">Department</label>
          <span className="tp-form-value">{profile.department}</span>
        </div>
        <div className="tp-form-field tp-form-field--wide">
          <label className="tp-form-label">Subject Areas</label>
          <span className="tp-form-value">{profile.subjects}</span>
        </div>
        <div className="tp-form-field">
          <label className="tp-form-label">Employee ID</label>
          <span className="tp-form-value tp-form-value--mono">{profile.employeeId}</span>
        </div>
        <div className="tp-form-field">
          <label className="tp-form-label">Joined</label>
          <span className="tp-form-value tp-form-value--mono">{profile.startYear}</span>
        </div>
      </div>

      <div className="tp-panel-divider" />

      <div className="tp-snapshot">
        <div className="tp-snapshot-item">
          <span className="tp-snapshot-value">47</span>
          <span className="tp-snapshot-label">Total students</span>
        </div>
        <div className="tp-snapshot-sep" />
        <div className="tp-snapshot-item">
          <span className="tp-snapshot-value">78<span className="tp-snapshot-suffix">%</span></span>
          <span className="tp-snapshot-label">Avg student score</span>
        </div>
        <div className="tp-snapshot-sep" />
        <div className="tp-snapshot-item">
          <span className="tp-snapshot-value">3</span>
          <span className="tp-snapshot-label">Courses published</span>
        </div>
        <div className="tp-snapshot-sep" />
        <div className="tp-snapshot-item">
          <span className="tp-snapshot-value">4</span>
          <span className="tp-snapshot-label">Active classes</span>
        </div>
      </div>

      <div className="tp-panel-divider" />

      <div className="tp-panel-note">
        <InfoIcon />
        To update your department or subject areas, contact your programme coordinator or submit a support ticket.
      </div>
    </div>
  )
}
