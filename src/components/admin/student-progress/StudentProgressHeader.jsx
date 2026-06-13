export default function StudentProgressHeader({ studentName, email, testCount, moduleCount }) {
  return (
    <div className="sp-header">
      <div className="sp-avatar">{studentName.charAt(0)}</div>

      <div className="sp-header-info">
        <h1 className="sp-name">{studentName}</h1>
        <span className="sp-email">{email}</span>
      </div>

      <div className="sp-header-stats">
        <div className="sp-stat">
          <span className="sp-stat-value">{testCount}</span>
          <span className="sp-stat-label">Tests taken</span>
        </div>
        <div className="sp-stat">
          <span className="sp-stat-value">{moduleCount}</span>
          <span className="sp-stat-label">Modules done</span>
        </div>
      </div>
    </div>
  )
}
