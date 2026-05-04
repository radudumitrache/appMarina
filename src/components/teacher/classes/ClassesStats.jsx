import '../../css/teacher/classes/ClassesStats.css'

export default function ClassesStats({ totalClasses, totalStudents, activeCount, avgProgress }) {
  return (
    <div className="classes-stats">
      <div className="stat-card">
        <span className="stat-label">Total Classes</span>
        <span className="stat-value">{totalClasses}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Total Students</span>
        <span className="stat-value">{totalStudents}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Active Classes</span>
        <span className="stat-value">{activeCount}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Avg. Progress</span>
        <span className="stat-value">{avgProgress}%</span>
      </div>
    </div>
  )
}
