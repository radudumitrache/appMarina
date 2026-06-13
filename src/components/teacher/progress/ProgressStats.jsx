import '../../css/teacher/progress/ProgressStats.css'

export default function ProgressStats({ totalStudents, classCount, avgPct }) {
  return (
    <div className="tp-stats">
      <div className="tp-stat-card">
        <span className="tp-stat-label">Total Students</span>
        <span className="tp-stat-value">{totalStudents}</span>
        <span className="tp-stat-sub">across {classCount} departments</span>
      </div>
      <div className="tp-stat-card">
        <span className="tp-stat-label">Avg. Progress</span>
        <span className="tp-stat-value">{avgPct}%</span>
        <span className="tp-stat-sub">module completion</span>
      </div>
    </div>
  )
}
