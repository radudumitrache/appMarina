import '../../css/trainer/progress/ProgressStats.css'

export default function ProgressStats({ totalCrew, classCount, avgPct }) {
  return (
    <div className="tp-stats">
      <div className="tp-stat-card">
        <span className="tp-stat-label">Total Crew Members</span>
        <span className="tp-stat-value">{totalCrew}</span>
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
