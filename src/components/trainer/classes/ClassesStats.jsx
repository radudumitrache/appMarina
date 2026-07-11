import '../../css/trainer/classes/ClassesStats.css'

export default function ClassesStats({ totalClasses, totalStudents, activeCount, avgProgress }) {
  return (
    <div className="classes-stats">
      <div className="stat-card">
        <span className="stat-label">Total Departments</span>
        <span className="stat-value">{totalClasses}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total Crew Members</span>
        <span className="stat-value">{totalStudents}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active Departments</span>
        <span className="stat-value">{activeCount}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Avg. Progress</span>
        <span className="stat-value">{avgProgress}%</span>
      </div>
    </div>
  )
}
