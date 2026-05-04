import '../../css/teacher/progress/ProgressStats.css'

export default function ProgressStats({ totalStudents, classCount, avgPct, avgScore, atRiskCount }) {
  return (
    <div className="tp-stats">
      <div className="tp-stat-card">
        <span className="tp-stat-label">Total Students</span>
        <span className="tp-stat-value">{totalStudents}</span>
        <span className="tp-stat-sub">across {classCount} classes</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-label">Avg. Progress</span>
        <span className="tp-stat-value">{avgPct}%</span>
        <span className="tp-stat-sub">lesson completion</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-label">Avg. Test Score</span>
        <span className="tp-stat-value">{avgScore}%</span>
        <span className="tp-stat-sub">across all tests</span>
      </div>
      <div className="tp-stat-card tp-stat-card--risk">
        <span className="tp-stat-label">At Risk</span>
        <span className="tp-stat-value tp-stat-value--risk">{atRiskCount}</span>
        <span className="tp-stat-sub">students need attention</span>
      </div>
    </div>
  )
}
