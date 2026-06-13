import '../../css/teacher/class-detail/ClassStats.css'

export default function ClassStats({ totalStudents, activeStudents, avgProgress, modulesComplete, modulesCount, subject }) {
  return (
    <div className="cd-stats">
      <div className="cd-stat-card">
        <span className="cd-stat-label">Students</span>
        <span className="cd-stat-value">{totalStudents}</span>
        <span className="cd-stat-sub">{activeStudents} active</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Avg. Progress</span>
        <span className="cd-stat-value">{avgProgress}%</span>
        <span className="cd-stat-sub">across all students</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Lessons Complete</span>
        <span className="cd-stat-value">{modulesComplete}/{modulesCount}</span>
        <span className="cd-stat-sub">by the whole department</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Subject</span>
        <span className="cd-stat-subject">{subject}</span>
      </div>
    </div>
  )
}
