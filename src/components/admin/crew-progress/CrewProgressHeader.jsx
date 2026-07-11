export default function CrewProgressHeader({ crewName, email, testCount, moduleCount, moduleLabel = 'Modules done' }) {
  return (
    <div className="sp-header">
      <div className="sp-avatar">{crewName.charAt(0)}</div>

      <div className="sp-header-info">
        <h1 className="sp-name">{crewName}</h1>
        <span className="sp-email">{email}</span>
      </div>

      <div className="sp-header-stats">
        <div className="sp-stat">
          <span className="sp-stat-value">{testCount}</span>
          <span className="sp-stat-label">Tests taken</span>
        </div>
        <div className="sp-stat">
          <span className="sp-stat-value">{moduleCount}</span>
          <span className="sp-stat-label">{moduleLabel}</span>
        </div>
      </div>
    </div>
  )
}
