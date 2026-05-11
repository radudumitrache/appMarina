export default function StudentProgressHeader({ studentName, email, testCount, lessonCount }) {
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
          <span className="sp-stat-value">{lessonCount}</span>
          <span className="sp-stat-label">Lessons done</span>
        </div>
      </div>
    </div>
  )
}
